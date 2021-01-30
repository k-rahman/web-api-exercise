const Ajv = require('ajv').default;

const userSchema = require('../schema/newUser.json');
const itemSchema = require('../schema/newItem.json');


const ajv = new Ajv({ strictTuples: false });

// add custom error message to images
ajv.addKeyword('imageRequired', {
  validate: validate = (schema, images) => {
    validate.errors = [{ keyword: 'min', message: 'You must provide at least 1 image' }];
    return images.length > 0;
  },
  errors: true
});

// check user information sent by client is in the right form
const validateUserData = (req, res, next) => {
  const valid = ajv.validate(userSchema, req.body);

  return valid ?
    next() : res.status(400).send(validate.errors.map(err => err.message));
};

// check user information sent by client is in the right form
const validateNewItem = (req, res, next) => {
  const valid = ajv.validate(itemSchema, req.body);

  return valid ?
    next() : res.status(400).send(validate.errors.map(err => err.message));
};


module.exports = {
  validateUserData,
  validateNewItem
}