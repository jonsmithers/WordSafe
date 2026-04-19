import {Command, Flags} from '@oclif/core'
import * as childProcess from 'node:child_process'
import * as fs from 'node:fs'
import {Readable} from 'node:stream'
import secureRemove from 'secure-remove'
import * as tmp from 'tmp'

export function openFile(editor: string, filepath: string) {
  return new Promise((resolve, reject) => {
    const [editorCmd, ...editorArgs] = editor.split(' ')
    const p = childProcess.spawn(editorCmd, [...editorArgs, filepath], {
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
      await secureRemove(tmpFile.name) // shred evidence
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
  /* eslint-disable-next-line semi */
  console.error(s);
}

export abstract class WordsafeCommand extends Command {
  async catch(error: unknown) {
    this.error(error as Error)
  }
}

export const SHARED_FLAGS = {
  editor(default_: string) {
    return {
      editor: Flags.string({char: 'e', default: default_, description: 'open unencrypted file with editor'}),
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
