const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const schema = require('./schema.json');

const ajv = new Ajv();
addFormats(ajv);

const validator = ajv.compile(schema);

function validate(manifest) {
  const valid = validator(manifest);
  return {
    valid,
    errors: validator.errors,
  };
}

module.exports = { validate };