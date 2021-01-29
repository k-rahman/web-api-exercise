const Ajv = require('ajv').default;
const userSchema = require('../schema/user.json');


const validateUserData = (req, res, next) => {
  const ajv = new Ajv();
  const validate = ajv.compile(userSchema);
  const valid = validate(req.body);

  return valid ?
    next() : res.status(400).send(validate.errors.map(err => err.message));
}

module.exports = validateUserData;