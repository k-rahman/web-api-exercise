const config = require('config');
const jwt = require('jsonwebtoken');

const generateToken = async (userId) => {
  return jwt.sign({ userId }, config.get('jwt'));
}

module.exports = generateToken;