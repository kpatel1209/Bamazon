const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const Table = require('cli-table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon_db"
});

connection.connect(function(err) {
    if (err) throw err;
    // Added \xa0 for spacing so "Welcome to Bamazon!" is centered over the product table.
    console.log(chalk.whiteBright("\n\t\t\t\xa0\xa0Welcome to Bamazon!\n"));
    showAllProducts();
});

var userChoice = {};

// Function that emptys the userChoice array so a new product can be placed inside of an empty array.
function emptyUserChoice() {
    userChoice = {};
}

// Function that shows all items for sale, but does not show the quantity available
function showAllProducts() {
    connection.query("SELECT * FROM products", (err, res) => {
        let productListing = new Table({
            head: [chalk.blueBright.bold("ID"), chalk.blueBright.bold("PRODUCT NAME"), chalk.blueBright.bold("DEPARTMENT"), chalk.blueBright.bold("PRICE")],
        });
        for (let i = 0; i < res.length; i++) {
            productListing.push([chalk.redBright.bold(res[i].item_id), res[i].product_name, res[i].department_name, chalk.greenBright(`$${res[i].price}`)]);
        }
        console.log(`${productListing.toString()}`);
        productID();
    });
};

// Function that asks the user to enter the product ID for the item they want to purchase
function productID() {
    inquirer.prompt({
        name: "productID",
        type: "input",
        message: "Hello! Please refer to the table above and enter the product ID you would like to purchase today.",
        // Check if the product ID entered by the user is a number between 1-10
        validate: function(value) {
            if (!isNaN(value) && (value > 0 && value <= 10)) {
                return true;
            } else {
                console.log(chalk.yellow("You must enter a product ID between 1-10 to move forward with your order."));
                return false;
            }
        }
    }).then(function(answer) {
        connection.query("SELECT item_id, product_name, department_name, price, stock_quantity, product_sales FROM products WHERE ?", { item_id: answer.productID }, function(err, res){
            // Check with the user if this is the correct product they want to purchase.
            productCheck(res[0].product_name, res);
        });
    });
};

// Function to check if the product chosen is correct
function productCheck(product, object) {
    inquirer.prompt({
        name: "productCheck",
        type: "confirm",
        message: `Please confirm if ` + chalk.blueBright.bold(`'${product}'`) + ` is the correct product you want to purchase?`
    }).then(function(answer) {
        if (answer.productCheck) {
            userChoice = {
                item_id: object[0].item_id,
                product_name: object[0].product_name,
                department_name: object[0].department_name,
                price: object[0].price,
                stock_quantity: object[0].stock_quantity,
                product_sales: object[0].product_sales
            };
            // Ask user the quantiy needed to purchase
            quantityNeeded(userChoice.item_id);
        } else {
            productID();
        }
    });
};

// Function for the quantity needed to purchase by the user
function quantityNeeded() {
    inquirer.prompt({
        name: "quantityNeeded",
        type: 'input',
        message: "How many would you like to purchase today?",
        validate: function(value) {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log(chalk.yellow("Please enter a number between 1-10"));
                return false;
            }
        }
    }).then(function(answer) {
        connection.query("SELECT stock_quantity FROM products WHERE ?", { item_id: userChoice.item_id }, function(err, res){
            // If there is not enough quantity to fulfill the order.
             if (res[0].stock_quantity < answer.quantityNeeded) {
                console.log(chalk.redBright.bold("\n\tSorry for any inconvenience, but we currently do not have that quantity amount in stock.\n"));
                inquirer.prompt({
                    name: "continue",
                    type: "confirm",
                    message: "Do you want to order a lesser quantity and try again?"
                }).then(function(answer) {
                    if (answer.continue) {
                        quantityNeeded(userChoice.item_id);
                    } else {
                        console.log(chalk.blue.bold('\n\tThank you, please visit us again soon!\n'));
                        connection.end();
                    }
                });
            // If there is enough quantity available then the order will move forward
            } else {
                userChoice.quantityNeeded = answer.quantityNeeded;
                console.log(chalk.red.bold("\n\tWe are processing your order..."));

                // MYSQL database needs to be updated with new quantity available and sales
                connection.query('UPDATE products SET ? WHERE ?', [
                    {
                        stock_quantity: userChoice.stock_quantity - answer.quantityNeeded,
                        product_sales: userChoice.product_sales + (userChoice.price * answer.quantityNeeded)
                    },
                    {
                        item_id: userChoice.item_id
                    }
                ], function(err, res) {
                    console.log(chalk.greenBright.bold(`\n\tThe total amount for your order is $${(userChoice.price * userChoice.quantityNeeded).toFixed(2)}.\n`));
                    newOrder();
                });
            }
        });
    });
}

// function to ask if user would like to make another purchase
function newOrder() {
    inquirer.prompt({
        name: "newOrder",
        type: "confirm",
        message: "Would you like to place another order?"
    }).then(function(answer){ 
        if (answer.newOrder) {
            emptyUserChoice();
            productID();
        } else {
            console.log(chalk.blueBright.bold("\n\tThanks for visiting Bamazon!  See you soon!"));
            connection.end();
        }
    });
};