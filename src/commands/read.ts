import {Args} from '@oclif/core'
import {cli} from 'cli-ux'
import * as fs from 'node:fs'

import encryption from '../encryption'
import {
  openFile, SHARED_FLAGS, withTempFile, WordsafeCommand,
} from '../utils'

export default class Read extends WordsafeCommand {
  static args = {
    file: Args.string({
      description: 'encrypted file',
      required: true,
    }),
  }
  static description = 'Decrypt contents for perusal (doesn\'t save changes)'
  static examples = [
    '$ wordsafe read encrypted-file\n',
    '$ wordsafe read encrypted-file --editor=cat\n# ^ this prints decrypted file to stdout',
  ]
  static flags = {
    ...SHARED_FLAGS.editor('less'),
    ...SHARED_FLAGS.legacyDecrypt,
    ...SHARED_FLAGS.legacyLegacyDecrypt,
  }

  async run() {
    const {args, flags} = await this.parse(Read)

    const editor = flags.editor!
    const password = await cli.prompt('Password', {required: false, type: 'hide'})
    await withTempFile(async tmpFile => {
      await encryption.filenames.decrypt(
        args.file!,
        tmpFile,
        password,
        {
          legacyDecryption: flags['legacy-decrypt'],
          legacyLegacyDecryption: flags['legacy-legacy-decrypt'],
        },
      )
      fs.chmodSync(tmpFile, 0o400) // make file readonly
      await openFile(editor, tmpFile)
      fs.chmodSync(tmpFile, 0o200)
    })
  }
}
