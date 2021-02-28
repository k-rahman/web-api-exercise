Drop DATABASE IF EXISTS kirpputori_tests;
CREATE DATABASE IF NOT EXISTS kirpputori_tests;
USE kirpputori_tests;

DROP TABLE items;
DROP TABLE users;
DROP TABLE categories;
DROP TABLE deliveryTypes;


CREATE TABLE users (
	id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	firstname VARCHAR(50) NOT NULL,
	lastname VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	phone VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
	id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(100) NULL
);

CREATE TABLE deliveryTypes (
	id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(100) NULL
);

CREATE TABLE items (
	id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	title VARCHAR(100) NOT NULL,
	description TEXT NOT NULL,
	price FLOAT NOT NULL,
	country VARCHAR(50) NOT NULL,
	city VARCHAR(50) NOT NULL,
	img1 VARCHAR(250) NOT NULL,
	img2 VARCHAR(250) NULL,
	img3 VARCHAR(250) NULL,
	img4 VARCHAR(250) NULL,
	category INT UNSIGNED NOT NULL,
	deliveryType INT UNSIGNED NOT NULL,
	seller INT UNSIGNED NOT NULL,
	createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT FOREIGN KEY 
		(category)
		REFERENCES categories(id)
        ON UPDATE CASCADE,
	CONSTRAINT FOREIGN KEY 
		(deliveryType)
		REFERENCES deliveryTypes(id)
        ON UPDATE CASCADE,
	CONSTRAINT FOREIGN KEY 
		(seller)
		REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        FULLTEXT (title, description)
) ENGINE = InnoDB;

INSERT INTO categories (name, icon) VALUE ('Books', 'bookshelf');
INSERT INTO categories (name, icon) VALUE ('Clothing', 'tshirt-crew');
INSERT INTO categories (name, icon) VALUE ('Electronics', 'laptop-mac');
INSERT INTO categories (name, icon) VALUE ('Furniture', 'bed-king');
INSERT INTO categories (name, icon) VALUE ('Games', 'cards');
INSERT INTO categories (name, icon) VALUE ('Music', 'guitar-acoustic');
INSERT INTO categories (name, icon) VALUE ('Accessories', 'necklace');
INSERT INTO categories (name, icon) VALUE ('Utensils', 'silverware-fork-knife');
INSERT INTO categories (name, icon) VALUE ('Others', 'exclamation-thick');


INSERT INTO deliveryTypes (name) VALUE ('Pickup');
INSERT INTO deliveryTypes (name) VALUE ('Delivery');