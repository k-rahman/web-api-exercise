const config = require("config");
const jwt = require("jsonwebtoken");

const generateToken = async user => {
  delete user.password;

  return jwt.sign({ user }, config.get("jwt"));
};

module.exports = generateToken;
