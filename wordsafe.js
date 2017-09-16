#!/usr/bin/env node

const chalk = require('chalk');
let usage =
`
${chalk.bold('wordsafe')}

Usage:
  wordsafe <command> [options]

Description:
  WordSafe makes it practical to decrypt and re-encrypted a plaintext file on a
  regular basis.
`.slice(1,-1);

require('yargs')
    .usage(usage)
    .command(require('./commands/init.js'))
    .command(require('./commands/edit.js'))
    .command('add', 'NOT IMPLEMENTED')
    .command(require('./commands/decrypt.js'))
    // .command('*', 'wut', ()=>{}, ()=>{ console.error('unrecognized'); })
    .option('v', {
      alias: 'verbose',
      describe: 'Chatty logs'
    })
    .boolean('verbose')
    .help()
    .command('*', '', ()=>{}, ()=> {
      console.error('you might want to run \n> wordsafe help');
      // require('yargs').showHelp();
    })
    // .alias('h', 'help')
    // .alias('h', '*')
    .argv;