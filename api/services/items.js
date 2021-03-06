const db = require("../db/index");
const error = require("../utils/errors");
const getSearchQuery = require("../utils/itemsQuery").getSearchQuery;
const getSelectQuery = require("../utils/itemsQuery").getSelectQuery;

// return all items or items the satisfy search criteria
const getItems = async query => {
  const searchQuery = await getSearchQuery(query);

  const items = await db.query(searchQuery);

  if (items.length === 0) {
    if (Object.entries(query).length === 0)
      throw error(404, "Oho, database is empty.\nBe the first to add an item!");
    throw error(404, `We couldn\'t find items with these criteria!`);
  }

  // images array coming back from mysql as String
  items.forEach(item => {
    const parsedDeliveryTypes = JSON.parse(item.deliveryType);
    const parsedCategories = JSON.parse(item.category);
    const parsedImages = JSON.parse(item.images);
    item.category = parsedCategories;
    item.deliveryType = parsedDeliveryTypes;
    item.images = parsedImages.filter(i => i !== null);
  });

  return items;
};

// return item by itemId
const getItemById = async itemId => {
  const item = await db.query(`${getSelectQuery()} WHERE i.id = ?`, itemId);

  if (item.length === 0) throw error(404, "Item Doesn't Exist!");

  const parsedDeliveryTypes = JSON.parse(item[0].deliveryType);
  const parsedCategories = JSON.parse(item[0].category);
  const parsedImages = JSON.parse(item[0].images);
  item[0].images = parsedImages.filter(i => i !== null);
  item[0].category = parsedCategories;
  item[0].deliveryType = parsedDeliveryTypes;

  return item[0];
};

// return item by itemId & userId (check if item belong to user)
const getItemByUser = async (itemId, userId) => {
  const item = await getItemById(itemId);

  const userItem = await db.query(
    "SELECT * from items WHERE id = ? and seller = ?",
    item.id,
    userId
  );

  if (userItem.length === 0) throw error(403, "Unauthorized user!");

  return userItem[0];
};

// return all items the belong to a userId
const getItemsByUser = async userId => {
  const userItems = await db.query(
    `${getSelectQuery()} WHERE seller = ?`,
    userId
  );

  if (userItems.length === 0)
    throw error(404, "Oho, you don't have any items!");

  userItems.forEach(item => {
    const parsedDeliveryTypes = JSON.parse(item.deliveryType);
    const parsedCategories = JSON.parse(item.category);
    const parsedImages = JSON.parse(item.images);
    item.category = parsedCategories;
    item.deliveryType = parsedDeliveryTypes;
    item.images = parsedImages.filter(i => i !== null);
  });

  return userItems;
};

// create a new item
const createNewItem = async item => {
  const {
    title,
    description,
    price,
    country,
    city,
    sellerId,
    categoryId,
    deliveryTypeId,
    images,
  } = item;

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
    sellerId,
  ];

  return await db.query(
    `INSERT INTO items 
    (title, description, price, country, city, img1, img2, 
      img3, img4, category, deliveryType, seller) VALUES (?)`,
    newItem
  );
};

// update item
const updateItem = async (item, itemId) => {
  const {
    title,
    description,
    price,
    country,
    city,
    sellerId,
    categoryId,
    deliveryTypeId,
    images,
  } = item;

  const updatedAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  await getItemByUser(itemId, sellerId);

  await db.query(
    `UPDATE items SET 
    title = ?, description = ?, price = ?, country = ?, city = ?, img1 = ?, 
    img2 =  ?, img3 = ?, img4 = ?, category = ?, deliveryType = ?, seller = ?, 
    updatedAt = ? WHERE id = ?`,
    title,
    description,
    price,
    country,
    city,
    images[0],
    images[1],
    images[2],
    images[3],
    categoryId,
    deliveryTypeId,
    sellerId,
    updatedAt,
    itemId
  );
};

// delete item
const deleteItem = async (itemId, userId) => {
  await getItemByUser(itemId, userId);

  await db.query(
    "DELETE FROM items WHERE id = ? and seller = ?",
    itemId,
    userId
  );
};

module.exports = {
  getItems,
  getItemById,
  getItemsByUser,
  createNewItem,
  updateItem,
  deleteItem,
};
