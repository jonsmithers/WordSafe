import {Args, Flags} from '@oclif/core'
import {cli} from 'cli-ux'
import CombinedStream from 'combined-stream'
import * as fs from 'node:fs'

import encryption from '../encryption'
import {SHARED_FLAGS, WordsafeCommand, makeDateStr, openFile, stringToStream, withTempFile} from '../utils'

export default class Push extends WordsafeCommand {
  static args = {
    file: Args.string({
      description: 'encrypted file',
      required: true,
    }),
  }

  static description = 'Open an empty editor for you to type in and append the contents you type to <file>'

  static examples = [
    '$ wordsafe push encrypted-file\n',
  ]

  static flags = {
    ...SHARED_FLAGS.editor('vim'),
    'prepend-date': Flags.boolean({char: 'd', description: 'prepend current date after closing file'}),
    'prepend-date-visibly': Flags.boolean({char: 'D', description: 'prepend current date before opening file'}),
  }

  async run() {
    const {args, flags} = await this.parse(Push)

    const editor = flags.editor!
    const password = await cli.prompt('Password', {required: false, type: 'hide'})

    // check that we can decrypt without throwing any error
    await withTempFile(async testFile => {
      await encryption.filenames.decrypt(args.file!, testFile, password)
    })

    // open empty file
    await withTempFile(async emptyTmpFile => {
      if (flags['prepend-date-visibly']) {
        fs.writeFileSync(emptyTmpFile, makeDateStr() + '\n')
      }

      await openFile(editor, emptyTmpFile)

      // decrypt real file, and concatenate
      await withTempFile(async decryptedTmpFile => {
        await encryption.filenames.decrypt(args.file!, decryptedTmpFile, password)
        const combinedStream = new CombinedStream()
        combinedStream.append(fs.createReadStream(decryptedTmpFile))
        if (flags['prepend-date']) {
          combinedStream.append(stringToStream(makeDateStr()))
        }

        combinedStream.append(fs.createReadStream(emptyTmpFile))
        await encryption.streams.encrypt(combinedStream as unknown as fs.ReadStream, fs.createWriteStream(args.file!), password)
      })
    })
  }
}
