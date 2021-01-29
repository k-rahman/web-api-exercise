const error = (name, message) => {
  const e = new Error(message);
  e.name = name;
  return e;
};

module.exports = error;