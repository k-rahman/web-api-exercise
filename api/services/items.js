const { query } = require('express');
const db = require('../db/index');
const error = require('../utils/errors');

// get item by itemId
const getItemById = async itemId => {
  const item =
    await db.query(`
    SELECT i.itemId, i.title, i.description, i.price, i.country, 
            i.city, concat(u.firstname, ' ', u.lastname) AS 'sellerName',
            u.phone AS 'contactInfo', i.img1, i.img2, i.img3, i.img4,
            c.name AS category, d.name AS deliveryType, i.createdAt, i.updatedAt 
    FROM items i
    JOIN users u ON u.userId = i.seller
    JOIN categories c ON c.categoryId = i.category
    JOIN deliveryTypes d ON d.deliveryTypeId = i.deliveryType
    WHERE itemId = ?`, itemId);


  if (item.length === 0)
    throw error(404, 'Item Doesn\'t Exist!');

  return item[0];
};

// get item by itemId & userId (check if item belong to user)
const getItemByUser = async (itemId, userId) => {
  const item = await getItemById(itemId);

  const userItem =
    await db.query('SELECT * from items WHERE itemId = ? and seller = ?', item.itemId, userId);

  if (userItem.length === 0)
    throw error(403, 'Unauthorized user!');

  return userItem[0];
};

// create a new item
const createNewItem = async (item) => {
  const { title, description, price, country, city,
    sellerId, categoryId, deliveryTypeId, images } = item;

  const newItem = [
    title,
    description,
    parseFloat(price),
    country,
    city,
    images[0],
    images[1],
    images[2],
    images[3],
    parseInt(categoryId),
    parseInt(deliveryTypeId),
    sellerId
  ];

  return await db.query(`INSERT INTO items 
    (title, description, price, country, city, img1, img2, 
      img3, img4, category, deliveryType, seller) VALUES (?)`, newItem);
};

// update item
const updateItem = async (item, itemId) => {
  const { title, description, price, country, city,
    sellerId, categoryId, deliveryTypeId, images } = item;

  const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await getItemByUser(itemId, sellerId);

  await db.query(`UPDATE items SET 
    title = ?, description = ?, price = ?, country = ?, city = ?, img1 = ?, 
    img2 =  ?, img3 = ?, img4 = ?, category = ?, deliveryType = ?, seller = ?, 
    updatedAt = ? WHERE itemId = ?`,
    title, description, price, country, city, images[0], images[1], images[2],
    images[3], categoryId, deliveryTypeId, sellerId, updatedAt, itemId);
};

// delete item
const deleteItem = async (itemId, userId) => {
  await getItemByUser(itemId, userId);

  await db.query('DELETE FROM items WHERE itemId = ? and seller = ?', itemId, userId);
}

module.exports = {
  getItemById,
  createNewItem,
  updateItem,
  deleteItem
}