import {Args, Flags} from '@oclif/core'
import {cli} from 'cli-ux'
import * as fs from 'node:fs'

import encryption from '../encryption'
import {
  makeDateStr, openFile, SHARED_FLAGS, withTempFile, WordsafeCommand,
} from '../utils'

export default class Edit extends WordsafeCommand {
  static args = {
    file: Args.string({
      description: 'encrypted file',
      required: true,
    }),
  }
  static description = 'Edit encrypted file with editor of your choice'
  static examples = [
    '$ wordsafe edit encrypted-file\n',
    '$ wordsafe edit encrypted-file --editor=nano\n',
  ]
  static flags = {
    ...SHARED_FLAGS.editor('vim'),
    ...SHARED_FLAGS.legacyDecrypt,
    ...SHARED_FLAGS.legacyLegacyDecrypt,
    'append-date': Flags.boolean({description: 'append current date to end of file'}),
  }

  async run() {
    const {args, flags} = await this.parse(Edit)

    const editor = flags.editor!
    const password = await cli.prompt('Password', {required: false, type: 'hide'})
    await withTempFile(async tmpFile => {
      await encryption.filenames.decrypt(args.file!, tmpFile, password, {
        legacyDecryption: flags['legacy-decrypt'],
        legacyLegacyDecryption: flags['legacy-legacy-decrypt'],
      })
      if (flags['append-date']) {
        fs.appendFileSync(tmpFile, makeDateStr())
      }

      await openFile(editor, tmpFile)
      await encryption.filenames.encrypt(tmpFile, args.file!, password)
    })
  }
}
