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
("Cards Against Humanity", "Toys", 25.00, 100),
("Becoming Michelle Obama", "Books", 19.50, 200),
("Ring Video Doorbell 2", "Electronics", 169.00, 100),
("Keurig Coffee Maker", "Kitchen & Dining", 87.16, 250),
("Code Names", "Toys", 14.79, 500),
("ThisWorx for TWC-01 Car Vacuum", "Automotive", 30.87, 150),
("Jenga Classic Game", "Toys", 8.55, 75),
("Llama Llama I Love You", "Books", 4.33, 100),
("Instant Pot Duo Mini", "Kitchen & Dining", 99.95, 100),
("Echo Dot (3rd Gen)", "Electronics", 49.99, 40);

