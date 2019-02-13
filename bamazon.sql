CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
    item_id INT NOT NULL AUTO_INCREMENT,
    product_name TEXT NOT NULL,
    department_name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL,
    product_sales DECIMAL(10, 2),
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES
("TV Remote", "Electronics", 29.99, 100),
("Pillow", "Home", 12.95, 200),
("Phone", "Electronics", 499.97, 100),
("Knives", "Kitchen", 50.75, 250),
("Candles", "Home", 10.99, 500),
("Backpack", "Kids", 25.49, 150),
("Barbie", "Toys", 14.99, 75),
("Race Car", "Toys", 51.75, 100),
("Silverware", "Kitchen", 25.69, 100),
("Alarm Clock", "Electronics", 19.99, 40);