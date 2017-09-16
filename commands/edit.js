const child_process = require('child_process');
const config        = require('../config.js');
const encryption    = require('../encryption.js');
const fs            = require('fs');
const inquirer      = require('inquirer');
const tmp           = require('tmp');

tmp.setGracefulCleanup(); // Cleanup temporary files even when an uncaught exception occurs
// TODO need to call cleanup callback for safety

module.exports = {
  command: 'edit <file>',
  describe: 'Edit encrypted file with editor of your choice',
  // builder(yargs) {
  //   yargs.example('hello');
  //   yargs.option('stdin-password', {
  //     alias: 'x',
  //     describe: 'Read password from stdin (NOT IMPLEMENTED)'
  //   });
  // },
  handler(argv) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Password',
      }
    ];
    var tmpFile;
    inquirer.prompt(questions).then(userinputs => {
      tmpFile = tmp.fileSync();
      encryption.streams.decrypt(
        fs.createReadStream(argv.file),
        fs.createWriteStream(tmpFile.name),
        userinputs.password
      ).then(() => {
        return config.openEditor(tmpFile.name);
      }).then(() => {
        return encryption.streams.encrypt(
          fs.createReadStream(tmpFile.name),
          fs.createWriteStream(argv.file),
          userinputs.password
        );
      }).catch(e => {
        tmpFile.removeCallback();
        console.error(e);
      });
    });
  }
};
