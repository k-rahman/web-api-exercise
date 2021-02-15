const getSelectQuery = _ =>
  `SELECT i.itemId, i.title, i.description, i.price, i.country, 
            i.city, concat(u.firstname, ' ', u.lastname) AS 'sellerName',
            u.phone AS 'contactInfo', JSON_ARRAY(i.img1, i.img2, i.img3, i.img4) as images,
            c.name AS category, d.name AS deliveryType, i.createdAt, i.updatedAt 
    FROM items i
    JOIN users u ON u.userId = i.seller
    JOIN categories c ON c.categoryId = i.category
    JOIN deliveryTypes d ON d.deliveryTypeId = i.deliveryType`;

const getSearchQuery = query => {
  let { keyword, category, country, city, date } = query;
  let selectItem = getSelectQuery();

  selectItem += " WHERE 1 = 1";

  if (keyword && keyword.length !== 0) {
    keyword = keyword.trim().replace(" ", "* ");
    keyword = keyword.padEnd(keyword.length + 1, "*");
    selectItem += ` AND MATCH (i.title, i.description) AGAINST ('${keyword}' IN BOOLEAN MODE)`;
  }

  if (category && category.length !== 0)
    selectItem += ` AND i.category = ${category}`;

  if (country && country.length !== 0)
    selectItem += ` AND i.country LIKE '%${country}%'`;

  if (city && city.length !== 0) selectItem += ` AND i.city LIKE '%${city}%'`;

  if (date && date.length !== 0)
    selectItem += ` AND i.createdAt LIKE '${date}%'`;

  return selectItem;
};

module.exports = {
  getSelectQuery,
  getSearchQuery,
};
