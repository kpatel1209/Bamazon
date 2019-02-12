CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
    ID INT NOT NULL AUTO_INCREMENT,
    PRODUCT VARCHAR (100) NULL,
    DEPARTMENT VARCHAR (100) NULL,
    PRICE DECIMAL (10, 2) NOT NULL,
    QTY INT default 0 NOT NULL,
    SALES DECIMAL (10, 2),
    PRIMARY KEY (id)
);

INSERT INTO products (product, department, price, stock) VALUES
("TV Remote", "Electronics", 29.99, 100),
("Pillow", "Home", "12.95", "200"),
("Phone", "Electronics", 499.97, 100),
("Knives", "Kitchen", 50.75, 250),
("Candles", "Home", 10.99, 500),
("Backpack", "Kids", 25.49, 150),
("Barbie", "Toys", 14.99, 75),
("Race Car", "Toys", 51.75, 100),
("Silverware", "Kitchen", 25.69, 100),
("Alarm Clock", "Electronics", 19.99, 40);

