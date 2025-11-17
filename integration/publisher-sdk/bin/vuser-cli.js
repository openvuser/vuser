#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const fs = require('fs');
const { validate } = require('../src/validator');

yargs(hideBin(process.argv))
  .command('validate <file>', 'Validate a vuser-manifest.json file', (yargs) => {
    return yargs.positional('file', {
      describe: 'Path to the vuser-manifest.json file',
      type: 'string'
    });
  }, (argv) => {
    console.log(`Validating ${argv.file}...`);
    try {
      const fileContent = fs.readFileSync(argv.file, 'utf8');
      const manifest = JSON.parse(fileContent);
      
      const { valid, errors } = validate(manifest);
      
      if (valid) {
        console.log('✅ Validation successful: Manifest is valid.');
      } else {
        console.error('❌ Validation failed:');
        console.error(errors);
      }
    } catch (e) {
      console.error(`Error reading or parsing file: ${e.message}`);
    }
  })
  .command('test <file>', 'Run a Playwright test on a manifest', (yargs) => {
    // This would be a more complex implementation
    console.log('Test command not yet implemented.');
  })
  .demandCommand(1)
  .help()
  .argv;