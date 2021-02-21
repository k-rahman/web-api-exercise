const config = require("config");
const mysql = require("mysql");

const dbCredentials = {
  connectionLimit: 10,
  host: config.get("database.host"),
  database: config.get("database.name"),
  port: config.get("database.port"),
  user: config.get("database.username"),
  password: config.get("database.password"),
};

const pool = mysql.createPool(dbCredentials);
console.log(`Connected to ${config.get("database.name")} ...`);

const createTables = async () => {
  try {
    await dbApi.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        email VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL);
  `);
    await dbApi.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      icon VARCHAR(100) NULL);
  `);
    await dbApi.query(`
    CREATE TABLE IF NOT EXISTS deliveryTypes (
      id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(50) NOT NULL,
      icon VARCHAR(100) NULL); 
  `);
    await dbApi.query(`
        CREATE TABLE IF NOT EXISTS items (
          id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
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
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT FOREIGN KEY (category)
              REFERENCES categories (id)
              ON UPDATE CASCADE,
          CONSTRAINT FOREIGN KEY (deliveryType)
              REFERENCES deliveryTypes (id)
              ON UPDATE CASCADE,
          CONSTRAINT FOREIGN KEY (seller)
              REFERENCES users (id)
              ON DELETE CASCADE ON UPDATE CASCADE,
          FULLTEXT ( title , description )
      )  ENGINE=INNODB;
  `);
  } catch (e) {
    console.log(e);
  }
};

const dropTables = async () => {
  try {
    await dbApi.query(`DROP TABLE IF EXISTS items;`);
    await dbApi.query(`DROP TABLE IF EXISTS users;`);
    await dbApi.query(`DROP TABLE IF EXISTS categories;`);
    await dbApi.query(`DROP TABLE IF EXISTS deliveryTypes;`);
  } catch (e) {
    console.log(e);
  }
};

const populateTables = async () => {
  try {
    await dbApi.query(`
      INSERT INTO users (firstname, lastname, email, password, phone)
        VALUES ('Kimo', 'Karim', 'karim@mail.com', '12345', '044-777-7777');
  `);

    await dbApi.query(`
      INSERT INTO categories (name, icon) VALUE ('cars', 'cars-icon');
  `);

    await dbApi.query(`
      INSERT INTO deliveryTypes (name, icon) VALUE ('pickup', null);
  `);

    await dbApi.query(`
      INSERT INTO items (title, description, price, country, city, img1, category, deliveryType, seller) 
        VALUES ('used VW', 'Very good condition 1990 VW', 500, 'Finland', 'Oulu', '848755-car.jpg', 1, 1, 1);
  `);
  } catch (e) {
    console.log(e);
  }
};

const cleanTables = async () => {
  await dbApi.query("DELETE FROM users");
  await dbApi.query("DELETE FROM categories");
  await dbApi.query("DELETE FROM deliveryTypes");
  await dbApi.query("DELETE FROM items");
};

const dbApi = {
  create: () => createTables(),
  drop: () => dropTables(),
  populate: () => populateTables(),
  clean: () => cleanTables(),
  query: (query, ...params) =>
    new Promise((resolve, reject) =>
      pool.query(query, params, (err, result) => {
        if (err) reject(err);

        resolve(result);
      })
    ),
  close: () => pool.end(),
};

module.exports = dbApi;
