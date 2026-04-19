import * as child_process from 'child_process'
import * as fs from 'fs'
import * as tmp from 'tmp'
import {Command, Flags} from '@oclif/core'
import {Readable} from 'stream'
import {polyfill} from 'secure-remove'

export function openFile(editor: string, filepath: string) {
  return new Promise((resolve, reject) => {
    const [editorCmd, ...editorArgs] = editor.split(' ')
    const p = child_process.spawn(editorCmd, [...editorArgs, filepath], {
      stdio: 'inherit',
    })
    p.on('close', resolve)
    p.on('error', reject)
  })
}

export async function withTempFile(cb: (tmpfilepath: string) => Promise<void>) {
  const tmpFile = tmp.fileSync()
  try {
    await cb(tmpFile.name)
  } finally {
    if (fs.existsSync(tmpFile.name)) {
      logInfoToStderr(`shredding ${tmpFile.name}`)
      await polyfill(tmpFile.name) // shred evidence
      logInfoToStderr(`removing ${tmpFile.name}`)
      tmpFile.removeCallback()
    }
  }
}

export function stringToStream(str: string): Readable {
  // https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
  let str2 = str
  if (str2.slice(-1) !== '\n') {
    str2 += '\n' // Adhere to POSIX
  }
  const stream = new Readable()
  stream._read = () => {/* nothing */}
  stream.push(str2)
  stream.push(null)
  return stream
}

function logInfoToStderr(s: string) {
  /* eslint-disable-next-line no-console, semi */
  console.error(s);
}

export abstract class WordsafeCommand extends Command {
  async catch(error: any) {
    this.error(error)
  }
}

export const SHARED_FLAGS = {
  editor(default_: string) {
    return {
      editor: Flags.string({char: 'e', description: 'open unencrypted file with editor', default: default_}),
    }
  },
  legacyDecrypt: {
    'legacy-decrypt': Flags.boolean({}),
  },
  legacyLegacyDecrypt: {
    'legacy-legacy-decrypt': Flags.boolean({}),
  },
}

export const makeDateStr = () => ('\n' + new Date().toDateString() + ' ' + new Date().toLocaleTimeString() + '\n\n')
