const db = require('../db/index');
const error = require('../utils/errors');

// return categories
const getAllCategories = async _ => {
  const categories = await db.query('SELECT * FROM categories');

  if (categories.length === 0)
    throw error(404, 'No Categories were found!');

  return categories;
};

module.exports = {
  getAllCategories
}