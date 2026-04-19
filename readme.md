WordSafe is a simple command line utility that makes it quick and easy to
create, read, and edit encrypted text files.

[![Version](https://img.shields.io/npm/v/wordsafe.svg)](https://npmjs.org/package/wordsafe)

# Install

```
npm install -g jonsmithers/WordSafe
```

This will also upgrade WordSafe if it's already installed.

# Example Usages

```bash
wordsafe init journal.txt                                         # create a new encrypted file (prompts for password)
wordsafe read journal.txt --editor=vim                            # show encrypted file
wordsafe edit journal.txt --editor=nano                           # edit encrypted file (re-encrypts when editor closes)
wordsafe push journal.txt --editor=vim --prepend-date-visibly     # open blank document and append to encrypted file when editor closes
wordsafe push journal.txt --editor='gvim --nofork' --prepend-date # gvim!
wordsafe help                                                     # view main documentation
wordsafe help edit                                                # view documentation on edit command
wordsafe help push                                                # view documentation on push command
wordsafe help read                                                # view documentation on read command
```

<!-- toc -->
* [Install](#install)
* [Example Usages](#example-usages)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g wordsafe
$ wordsafe COMMAND
running command...
$ wordsafe (--version)
wordsafe/4.0.0 darwin-arm64 node-v25.8.1
$ wordsafe --help [COMMAND]
USAGE
  $ wordsafe COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`wordsafe autocomplete [SHELL]`](#wordsafe-autocomplete-shell)
* [`wordsafe edit FILE`](#wordsafe-edit-file)
* [`wordsafe help [COMMAND]`](#wordsafe-help-command)
* [`wordsafe init FILE`](#wordsafe-init-file)
* [`wordsafe push FILE`](#wordsafe-push-file)
* [`wordsafe read FILE`](#wordsafe-read-file)

## `wordsafe autocomplete [SHELL]`

Display autocomplete installation instructions.

```
USAGE
  $ wordsafe autocomplete [SHELL] [-r]

ARGUMENTS
  [SHELL]  (zsh|bash|powershell) Shell type

FLAGS
  -r, --refresh-cache  Refresh cache (ignores displaying instructions)

DESCRIPTION
  Display autocomplete installation instructions.

EXAMPLES
  $ wordsafe autocomplete

  $ wordsafe autocomplete bash

  $ wordsafe autocomplete zsh

  $ wordsafe autocomplete powershell

  $ wordsafe autocomplete --refresh-cache
```

_See code: [@oclif/plugin-autocomplete](https://github.com/oclif/plugin-autocomplete/blob/v3.2.45/src/commands/autocomplete/index.ts)_

## `wordsafe edit FILE`

Edit encrypted file with editor of your choice

```
USAGE
  $ wordsafe edit FILE [-e <value>] [--legacy-decrypt] [--legacy-legacy-decrypt] [--append-date]

ARGUMENTS
  FILE  encrypted file

FLAGS
  -e, --editor=<value>         [default: vim] open unencrypted file with editor
      --append-date            append current date to end of file
  --legacy-decrypt
  --legacy-legacy-decrypt

DESCRIPTION
  Edit encrypted file with editor of your choice

EXAMPLES
  $ wordsafe edit encrypted-file

  $ wordsafe edit encrypted-file --editor=nano
```

_See code: [src/commands/edit.ts](https://github.com/jonsmithers/wordsafe/blob/v4.0.0/src/commands/edit.ts)_

## `wordsafe help [COMMAND]`

Display help for wordsafe.

```
USAGE
  $ wordsafe help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for wordsafe.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.44/src/commands/help.ts)_

## `wordsafe init FILE`

Set up a new encrypted text file

```
USAGE
  $ wordsafe init FILE

ARGUMENTS
  FILE  encrypted file

DESCRIPTION
  Set up a new encrypted text file

EXAMPLES
  $ wordsafe init <file>
```

_See code: [src/commands/init.ts](https://github.com/jonsmithers/wordsafe/blob/v4.0.0/src/commands/init.ts)_

## `wordsafe push FILE`

Open an empty editor for you to type in and append the contents you type to <file>

```
USAGE
  $ wordsafe push FILE [-e <value>] [-d] [-D]

ARGUMENTS
  FILE  encrypted file

FLAGS
  -D, --prepend-date-visibly  prepend current date before opening file
  -d, --prepend-date          prepend current date after closing file
  -e, --editor=<value>        [default: vim] open unencrypted file with editor

DESCRIPTION
  Open an empty editor for you to type in and append the contents you type to <file>

EXAMPLES
  $ wordsafe push encrypted-file
```

_See code: [src/commands/push.ts](https://github.com/jonsmithers/wordsafe/blob/v4.0.0/src/commands/push.ts)_

## `wordsafe read FILE`

Decrypt contents for perusal (doesn't save changes)

```
USAGE
  $ wordsafe read FILE [-e <value>] [--legacy-decrypt] [--legacy-legacy-decrypt]

ARGUMENTS
  FILE  encrypted file

FLAGS
  -e, --editor=<value>         [default: less] open unencrypted file with editor
  --legacy-decrypt
  --legacy-legacy-decrypt

DESCRIPTION
  Decrypt contents for perusal (doesn't save changes)

EXAMPLES
  $ wordsafe read encrypted-file

  $ wordsafe read encrypted-file --editor=cat
  # ^ this prints decrypted file to stdout
```

_See code: [src/commands/read.ts](https://github.com/jonsmithers/wordsafe/blob/v4.0.0/src/commands/read.ts)_
<!-- commandsstop -->
