const getSelectQuery = _ =>
  `SELECT i.id, i.title, i.description, i.price, i.country, 
            i.city, concat(u.firstname, ' ', u.lastname) AS 'sellerName',
            u.phone AS 'contactInfo', JSON_ARRAY(i.img1, i.img2, i.img3, i.img4) as images,
            JSON_OBJECT('id', c.id, 'name', c.name, 'icon', c.icon) AS category, 
            JSON_OBJECT('id', d.id, 'name', d.name, 'icon', d.icon) AS deliveryType,
            i.createdAt, i.updatedAt 
    FROM items i
    JOIN users u ON u.id = i.seller
    JOIN categories c ON c.id = i.category
    JOIN deliveryTypes d ON d.id = i.deliveryType`;

const getSearchQuery = query => {
  if ("params" in query) query = JSON.parse(query.params);

  let { keyword, category, country, city, from, to } = query;

  let selectItems = getSelectQuery();

  selectItems += " WHERE 1 = 1";

  if (keyword && keyword.length !== 0) {
    keyword = keyword.trim().replace(" ", "* ");
    keyword = keyword.padEnd(keyword.length + 1, "*");
    selectItems += ` AND MATCH (i.title, i.description) AGAINST ('${keyword}' IN BOOLEAN MODE)`;
  }

  if (category && category.length !== 0)
    selectItems += ` AND i.category = ${category.id}`;

  if (country && country.length !== 0)
    selectItems += ` AND i.country LIKE '%${country}%'`;

  if (city && city.length !== 0) selectItems += ` AND i.city LIKE '%${city}%'`;

  if (from && from.length !== 0 && to && to.length !== 0)
    selectItems += ` AND cast(i.createdAt as date) between '${from.slice(
      0,
      10
    )}' AND '${to.slice(0, 10)}'`;

  return selectItems;
};

module.exports = {
  getSelectQuery,
  getSearchQuery,
};
