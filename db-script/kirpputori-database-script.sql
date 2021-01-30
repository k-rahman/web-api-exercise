Drop DATABASE IF EXISTS kirpputori;
CREATE DATABASE kirpputori;
USE kirpputori;

CREATE TABLE users (
	userId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	firstname VARCHAR(50) NOT NULL,
	lastname VARCHAR(50) NOT NULL,
	email VARCHAR(50) NOT NULL,
	password VARCHAR(100) NOT NULL,
	phone VARCHAR(50) NOT NULL
);

CREATE TABLE categories (
	categoryId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(100) NULL
);

CREATE TABLE deliveryTypes (
	deliveryTypeId INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(50) NOT NULL,
	icon VARCHAR(100) NULL
);

CREATE TABLE items (
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
	createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
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

INSERT INTO categories (name) VALUE ('Cars');
INSERT INTO deliveryTypes (name) VALUE ('Pickup');
INSERT INTO users (firstname, lastname, email, password, phone)
	VALUES ('Karim', 'Abdelrahman', 'karim@hotmail.com', '12345', '044-777-7777');

INSERT INTO items (title, description, price, country, city, img1, category, deliveryType, seller) 
	VALUES ('used VW', 'Very good condition 1990 VW', 500, 'Finland', 'Oulu', '/uploads/vw.jpg', 1, 1, 1);

DELETE FROM users;
DELETE FROM items;

