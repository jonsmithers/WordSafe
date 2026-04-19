import {Args} from '@oclif/core'
import cli from 'cli-ux'
import * as fs from 'fs'
import encryption from '../encryption'
import {stringToStream, WordsafeCommand} from '../utils'

export default class Init extends WordsafeCommand {
  static description = 'Set up a new encrypted text file'

  static examples = [
    '$ wordsafe init <file>\n',
  ]

  static args = {
    file: Args.string({
      description: 'encrypted file',
      required: true,
    }),
  }

  async run() {
    const {args} = await this.parse(Init)

    const password = await cli.prompt('Password', {type: 'hide', required: false})
    const file = args.file!
    const unencryptedStream = stringToStream('Welcome to your encrypted text file :-)')
    await encryption.streams.encrypt(unencryptedStream, fs.createWriteStream(file), password)
    .catch(this.error)
  }
}
