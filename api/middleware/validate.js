const Ajv = require('ajv').default;

const removeImages = require('../utils/images');
const userSchema = require('../schema/newUser.json');
const itemSchema = require('../schema/newItem.json');


const ajv = new Ajv({ strictTuples: false, strict: false });

// add custom error message to images
ajv.addKeyword({
  keyword: 'imageRequired',
  validate: validate = (schema, images) => {
    validate.errors = [{ keyword: 'min', message: 'Images field is required and must contain at least 1 image' }];
    return images.length > 0;
  },
  errors: true
});

// check user information sent by client is in the right form
const validateUserData = (req, res, next) => {
  const validate = ajv.compile(userSchema);
  const valid = validate(req.body);

  return valid ?
    next() : res.status(400).send(validate.errors.map(err => err.message));
};

// check user information sent by client is in the right form
const validateNewItem = (req, res, next) => {
  const validate = ajv.compile(itemSchema);
  const valid = validate(req.body);

  // if itemschema is invalid remove the uploaded image ...
  if (!valid) {
    removeImages(req.body.images);

    return res.status(400).send(validate.errors.map(err => err.message));
  }

  next();
};


module.exports = {
  validateUserData,
  validateNewItem,
  ajv
}