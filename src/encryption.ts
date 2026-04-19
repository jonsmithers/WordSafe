import * as crypto from 'crypto'
import * as fs from 'fs'
import streamToPromise from 'stream-to-promise'
import * as stream from 'stream'
import zlib from 'zlib'

interface Header {
  version: number;
  sizeOfIv: number;
}

const encryption = {
  filenames: {
    decrypt(
      encryptedFilename: string,
      decryptedFilename: string,
      password: string,
      opts: {
        legacyLegacyDecryption?: boolean;
        legacyDecryption?: boolean;
      } = {}
    ) {
      if (opts.legacyLegacyDecryption || opts.legacyDecryption) {
        return encryption.streams.decryptLegacy(fs.createReadStream(encryptedFilename), fs.createWriteStream(decryptedFilename), password, opts)
      }
      return encryption.streams.decrypt(fs.createReadStream(encryptedFilename), fs.createWriteStream(decryptedFilename), password)
    },
    encrypt(decryptedFilename: string, encryptedFilename: string, password: string) {
      return encryption.streams.encrypt(fs.createReadStream(decryptedFilename), fs.createWriteStream(encryptedFilename), password)
    },
  },
  streams: {

    encrypt(inputStream: fs.ReadStream | stream.Readable, outputStream: fs.WriteStream, password: string) {
      const {iv, size: sizeOfIv} = randomInitializationVector()

      const header: Header = {
        version: 1,
        sizeOfIv,
      }
      const headerData = zlib.gzipSync(JSON.stringify(header))

      outputStream.write(Uint8Array.of(headerData.length), 'binary')
      outputStream.write(headerData)
      outputStream.write(iv)

      const cipher = crypto.createCipheriv('aes192', passwordToKey(password), iv)

      return stream.promises.pipeline(
        inputStream,
        cipher,
        outputStream
      )
    },

    async decrypt(inputStream: fs.ReadStream, outputStream: fs.WriteStream, password: string) {
      const sizeOfHeader = await new Promise<number>(resolve => {
        inputStream.once('readable', () => {
          const buffer = inputStream.read(1) as Buffer
          resolve(buffer[0])
        })
      })

      const header = await new Promise<Header>(resolve => {
        inputStream.once('readable', () => {
          const headerBuffer = inputStream.read(sizeOfHeader) as Buffer
          const header: Header = JSON.parse(zlib.gunzipSync(headerBuffer).toString())
          resolve(header)
        })
      })

      const iv = await new Promise<Uint8Array>(resolve => {
        inputStream.once('readable', () => {
          const iv = inputStream.read(header.sizeOfIv) as Buffer
          resolve(iv)
        })
      });

      const cipher = crypto.createDecipheriv(
        'aes-192-cbc',
        passwordToKey(password),
        iv
      );
      return stream.promises.pipeline(
        inputStream,
        cipher,
        outputStream,
      );
    },

    decryptLegacy(inputStream: fs.ReadStream, outputStream: fs.WriteStream, password: string, opts: { legacyLegacyDecryption?: boolean } = {}) {
      /* eslint-disable no-throw-literal */
      const cipher = opts.legacyLegacyDecryption ?
        crypto.createDecipheriv('aes-192-cbc', ...evpBytesToKey(password, 24, 8)) :
        crypto.createDecipheriv('aes-192-cbc', passwordToKey(password), LEGACY_INITIALIZATION_VECTOR)
      inputStream.pipe(cipher).pipe(outputStream)

      return Promise.all([
        streamToPromise(inputStream).catch(error => {
          throw 'Failed to read file. ' + error.message
        }),
        streamToPromise(cipher).catch(error      => {
          throw 'Failed to decrypt. Bad password? ' + error.message
        }),
      ])
      /* eslint-enable node/no-deprecated-api no-throw-literal */
    },
  },
}

const LEGACY_INITIALIZATION_VECTOR = new Uint8Array(16);
[
  98,
  220,
  35,
  58,
  74,
  84,
  5,
  199,
  224,
  202,
  232,
  232,
  61,
  179,
  156,
  3,
].forEach((v, i) => {
  LEGACY_INITIALIZATION_VECTOR[i] = v
})

function randomInitializationVector() {
  const iv = new Uint8Array(16)
  crypto.randomFillSync(iv)
  return {iv, size: 16}
}

// Replicates OpenSSL EVP_BytesToKey (MD5, no salt, 1 iteration) — the key
// derivation that the removed crypto.createDecipher() used internally.
function evpBytesToKey(password: string, keyLen: number, ivLen: number): [Buffer, Buffer] {
  const pass = Buffer.from(password, 'binary')
  let key = Buffer.alloc(0)
  let iv = Buffer.alloc(0)
  let prev = Buffer.alloc(0)
  while (key.length < keyLen || iv.length < ivLen) {
    prev = crypto.createHash('md5').update(prev).update(pass).digest()
    const keyNeeded = keyLen - key.length
    key = Buffer.concat([key, prev.subarray(0, Math.min(keyNeeded, prev.length))])
    if (key.length >= keyLen) {
      const ivNeeded = ivLen - iv.length
      iv = Buffer.concat([iv, prev.subarray(Math.min(keyNeeded, prev.length), Math.min(keyNeeded + ivNeeded, prev.length))])
    }
  }
  return [key.subarray(0, keyLen), iv.subarray(0, ivLen)]
}

function passwordToKey(password: string): Buffer {
  return crypto.pbkdf2Sync(password, 'salt', 100000, 192 / 8, 'sha512')
}

export default encryption
