const config = require('config');
const mysql = require('mysql');

const dbCredentials = {
  connectionLimit: 10,
  host: config.get('database.host'),
  database: config.get('database.name'),
  port: config.get('database.port'),
  user: config.get('database.username'),
  password: config.get('database.password')
};

const pool = mysql.createPool(dbCredentials);

const createTables = async () => {
  try {
    await dbApi.query(`
      CREATE TABLE IF NOT EXISTS users (
        userId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL);
  `);
    await dbApi.query(`
    CREATE TABLE IF NOT EXISTS categories (
      categoryId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      icon VARCHAR(100) NULL);
  `);
    await dbApi.query(`
    CREATE TABLE IF NOT EXISTS deliveryTypes (
      deliveryTypeId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      icon VARCHAR(100) NULL); 
  `);
    await dbApi.query(`
    CREATE TABLE IF NOT EXISTS items (
      itemId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      price FLOAT NOT NULL,
      country VARCHAR(50) NOT NULL,
      city VARCHAR(50) NOT NULL,
      img1 VARCHAR(100) NOT NULL,
      img2 VARCHAR(100) NULL,
      img3 VARCHAR(100) NULL,
      img4 VARCHAR(100) NULL,
      category INT UNSIGNED NOT NULL,
      deliveryType INT UNSIGNED NOT NULL,
      seller INT UNSIGNED NOT NULL,
      createAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT FOREIGN KEY 
        (category)
        REFERENCES categories(categoryId),
      CONSTRAINT FOREIGN KEY 
        (deliveryType)
        REFERENCES deliveryTypes(deliveryTypeId),
      CONSTRAINT FOREIGN KEY 
        (seller)
        REFERENCES users(userId)
    ) ENGINE = InnoDB;
  `);
  }
  catch (e) {
    console.log(e)
  };
};

const dropTables = async () => {
  try {
    await dbApi.query(`DROP TABLE IF EXISTS items;`);
    await dbApi.query(`DROP TABLE IF EXISTS users;`);
    await dbApi.query(`DROP TABLE IF EXISTS categories;`);
    await dbApi.query(`DROP TABLE IF EXISTS deliveryTypes;`);
  }
  catch (e) {
    console.log(e);
  }
};

const dbApi = {
  create: () => createTables(),
  drop: () => dropTables(),
  query: (query, ...params) => {
    return new Promise((resolve, reject) => {
      pool.query(query, params, (err, result) => {
        if (err)
          reject(err);

        resolve(result);
      });
    });
  },
  close: () => pool.end()
}

module.exports = dbApi;