const config     = require('../config.js');
const encryption = require('../encryption.js');
const inquirer   = require('inquirer');
const tmp        = require('tmp');
const yargutils  = require('../utils/yarg-utils.js');

tmp.setGracefulCleanup(); // Cleanup temporary files even when an uncaught exception occurs
// TODO need to call cleanup callback for safety

module.exports = {
  command: 'edit <file>',
  describe: 'Edit encrypted file with editor of your choice',
  builder(yargs) {
    yargs.string('e');
    yargutils.options.customEditorOption(yargs);
    yargs.option('e', {
      alias: 'editor',
      describe: '(NOT IMPLEMENTED) Override default/pre-configured editor'
    });
    yargs.boolean('d');
    yargs.option('d', {
      alias: 'append-date',
      describe: '(NOT IMPLEMENTED) Append today\'s date'
    });
    yargs.boolean('x');
    yargs.option('x', {
      alias: 'stdin-password',
      describe: '(NOT IMPLEMENTED) Read password from stdin'
    });
  },
  async handler(argv) {
    var questions = [
      {
        name: 'password',
        type: 'password',
        message: 'Password',
      }
    ];

    var userinputs = await inquirer.prompt(questions);
    var tmpFile = tmp.fileSync();
    try {
      await encryption.filenames.decrypt(argv.file, tmpFile.name, userinputs.password);
      await config.openEditor(tmpFile.name, argv);
      await encryption.filenames.encrypt(tmpFile.name, argv.file, userinputs.password);
    } catch(e) {
      console.error(e);
    }
    tmpFile.removeCallback();
  }
};
