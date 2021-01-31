const getSelectQuery = _ =>
  `SELECT i.itemId, i.title, i.description, i.price, i.country, 
            i.city, concat(u.firstname, ' ', u.lastname) AS 'sellerName',
            u.phone AS 'contactInfo', i.img1, i.img2, i.img3, i.img4,
            c.name AS category, d.name AS deliveryType, i.createdAt, i.updatedAt 
    FROM items i
    JOIN users u ON u.userId = i.seller
    JOIN categories c ON c.categoryId = i.category
    JOIN deliveryTypes d ON d.deliveryTypeId = i.deliveryType`;

const getSearchQuery = query => {
  let { keyword, category, country, city, date } = query;
  let selectItem = getSelectQuery();

  selectItem += ' WHERE 1 = 1';

  if (keyword && keyword.length !== 0) {
    keyword = keyword.trim().replace(' ', '|');
    selectItem += ` AND i.title RLIKE '${keyword}' OR i.description RLIKE '${keyword}'`;
  }

  if (category && category.length !== 0)
    selectItem += ` AND i.category = ${category}`;

  if (country && country.length !== 0) {
    country = country.trim().replace(' ', '|');
    selectItem += ` AND i.country RLIKE '${country}'`;
  }

  if (city && city.length !== 0) {
    city = city.trim().replace(' ', '|');
    selectItem += ` AND i.city RLIKE '${city}'`;
  }

  if (date && date.length !== 0)
    selectItem += ` AND i.createdAt LIKE '${date}%'`;

  return selectItem;
};

module.exports = {
  getSelectQuery,
  getSearchQuery
}