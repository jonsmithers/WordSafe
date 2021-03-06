const CombinedStream  = require('combined-stream');
const config          = require('../config.js');
const encryption      = require('../encryption.js');
const fs              = require('fs');
const streamUtils     = require('../utils/stream-utils.js');
const tmp             = require('tmp');
const yargutils       = require('../utils/yarg-utils.js');
const { makeDateStr } = require('../utils/misc.js');
const { polyfill }    = require('secure-remove');


tmp.setGracefulCleanup(); // Cleanup temporary files even when an uncaught exception occurs
// TODO need to call cleanup callback for safety

module.exports = {
  command: 'push <file>',
  describe: 'Open an empty editor for you to type in and append the contents you type to <file>',
  builder(yargs) {
    yargutils.options.customEditorOption(yargs);
    yargs.boolean('D');
    yargs.option('D', {
      alias: 'prepend-date-loudly',
      default: false,
      describe: 'Prepend today\'s date before opening editor'
    });
    yargs.boolean('d');
    yargs.option('d', {
      alias: 'prepend-date-quietly',
      default: false,
      describe: 'Prepend today\'s date after editor is closed'
    });
    yargs.boolean('x');
    yargs.option('x', {
      alias: 'stdin-password',
      describe: '(NOT IMPLEMENTED) Read password from stdin'
    });
  },
  async handler(argv) {
    var {password} = await new yargutils.Prompter().password().prompt();
    var tmpFileWithNewContent, tmpFileForDecryption;
    try {

      { // check that we can decrypt without throwing any error
        let tmpFile = tmp.fileSync();
        await encryption.filenames.decrypt(argv.file, tmpFile.name, password);
        await polyfill(tmpFile.name); // shred evidence
        tmpFile.removeCallback();
      }

      // open empty file
      tmpFileWithNewContent = tmp.fileSync();
      if (argv['prepend-date-loudly']) {
        fs.writeFileSync(tmpFileWithNewContent.name, makeDateStr() + '\n');
      }
      await config.openEditor(tmpFileWithNewContent.name, argv);

      tmpFileForDecryption = tmp.fileSync();
      await encryption.filenames.decrypt(argv.file, tmpFileForDecryption.name, password);

      var combinedStream = new CombinedStream();
      combinedStream.append(fs.createReadStream(tmpFileForDecryption.name));
      if (argv['prepend-date-quietly']) combinedStream.append(streamUtils.fromString(makeDateStr()));
      combinedStream.append(fs.createReadStream(tmpFileWithNewContent.name));

      await encryption.streams.encrypt(combinedStream, fs.createWriteStream(argv.file), password);
    } catch(e) {
      console.error(e);
    }
    await polyfill(tmpFileWithNewContent.name); // shred evidence
    await polyfill(tmpFileForDecryption.name); // shred evidence
    tmpFileWithNewContent.removeCallback();
    tmpFileForDecryption.removeCallback();
  }
};
