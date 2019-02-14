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
    // Added \t\xa0 for spacing so "Welcome to Bamazon!" is centered over the product table.
    console.log(chalk.yellowBright.bold("\n\xa0\xa0Welcome to Bamazon Manager!\n"));
    menuOptions();
});

let updateProduct = {};
let deleteProduct = {};

// Function to view menu options with a switch case that will run the appropriate function based on the user's choice.
function menuOptions() {
    inquirer.prompt({
        name: "options",
        type: "rawlist",
        message: "What would you like to do today?",
        choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product",
            "Remove Product"
        ]
    }).then(function(answer){
        switch(answer.options) {
            case "View Products for Sale":
                viewProductsForSale();
            break;
            case "View Low Inventory":
                viewLowInventory();
            break;
            case "Add to Inventory":
                addToInventory();
            break;
            case "Add New Product":
                addNewProduct();
            break;
            case "Remove Product":
                removeProduct();
            break;
        }
    });
};

// Function that display all of the products currently for sale
function viewProductsForSale() {
    connection.query("SELECT * FROM products", (err, res) => {
        let productListing = new Table({
            head: [chalk.blueBright.bold("ID"), chalk.blueBright.bold("PRODUCT NAME"), chalk.blueBright.bold("DEPARTMENT"), chalk.blueBright.bold("PRICE"), chalk.blueBright.bold("QTY")],
        });
        for (let i = 0; i < res.length; i++) {
            productListing.push([chalk.redBright.bold(res[i].item_id), res[i].product_name, res[i].department_name, chalk.greenBright(`$${res[i].price}`), res[i].stock_quantity]);
        }
        console.log(`${productListing.toString()}`);
        connection.end();
    });
};

// Function that display inventory 
function viewLowInventory() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5 ORDER BY stock_quantity DESC", function(err, res){
        if (res.length > 0) {
            let productListing = new Table({
                head: [chalk.blueBright.bold("ID"), chalk.blueBright.bold("PRODUCT NAME"), chalk.blueBright.bold("DEPARTMENT"), chalk.blueBright.bold("PRICE"), chalk.blueBright.bold("QTY")],
            });
            for (let i =0; i < res.length; i++) {
                productListing.push([chalk.redBright.bold(res[i].item_id), res[i].product_name, res[i].department_name, chalk.greenBright(`$${res[i].price}`), chalk.redBright.bold(res[i].stock_quantity)]);
            }
            console.log(`${productListing.toString()}`);
        } else {
            console.log(chalk.redBright(`\n\tYou currently do not have any low inventory!`));
        }
        connection.end();
    });
};

function addToInventory(){
    // productID also includes functions for productCheck and quantityNeeded.
    productID();
};

function addNewProduct(){
    inquirer.prompt([
        {
            name: "productName",
            type: "input",
            message: "Please enter the product name:"
        },
        {
            name: "departmentName",
            type: "input",
            message: "Please enter the department name:"
        },
        {
            name: "price",
            type: "input",
            message: "Please enter the price:",
            validate: function(value) {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.redBright.bold("Please enter a price higher than $0.00."));
                    return false;
                }
            }
        },
        {
            name: "stockQuantity",
            type: "input",
            message: "Please enter the quantity:",
            validate: function(value) {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    console.log(chalk.redBright.bold("You must enter a quantity greater than 0."));
                }
            }
        },
    ]).then(function(answer) {
        connection.query("INSERT INTO products SET ?", {
            product_name: answer.productName,
            department_name: answer.departmentName,
            price: answer.price,
            stock_quantity: answer.stockQuantity
        }, function(err, res) {
            if (err) throw err;
            console.log(chalk.redBright.bold(`The '${answer.productName}' product has been added to the ${answer.departmentName} department of your inventory!`));
            viewProductsForSale();
        });
    });
};

function removeProduct(){
    inquirer.prompt({
        name: "productID",
        type: "input",
        message: "Please enter the product ID you need to remove:"
    }).then(function(answer) {
        connection.query("SELECT * FROM products WHERE ?", { item_id: answer.productID }, function(err, res) { 
            inquirer.prompt({
                name: "check",
                type: "confirm",
                message: `Are you sure you want to delete the ` + chalk.redBright.bold(`'${res[0].product_name}'`) + ` product?`
            }).then(function(answer) {
                if (answer.check) {
                    deleteProduct = {
                        item_id: res[0].item_id,
                    };
                    connection.query(`DELETE FROM products WHERE ?`, { item_id: deleteProduct.item_id }, function(err, res) {
                        if (err) throw err;
                        console.log(chalk.redBright.bold("\nThe product has been removed from your inventory.\n");
                        viewProductsForSale();
                    });
                } else {
                    removeProduct();
                }
            });
        });
    });
};

function productID() {
    inquirer.prompt({
        name: "productID",
        type: "input",
        message: "Please enter the product ID you would like to update today.",
        // Checks if the product ID entered by the user is a number between 1-10
        validate: (value) => {
            if (!isNaN(value) && (value > 0 && value <= 10)) {
                return true;
            } else {
                console.log(chalk.redBright("You must enter a product ID between 1-10 to move forward."));
                return false;
            }
        }
        // select all rows where ID = user's input
    }).then(function(answer) {
        connection.query('SELECT * FROM products WHERE ?', { item_id: answer.productID }, (err, res) => {
            productCheck(res[0].product_name, res);
        });
    });
};

function productCheck(product, object) {
    inquirer.prompt({
        name: "productCheck",
        type: "confirm",
        message: `Please confirm if ` + chalk.blueBright.bold(`'${product}'`) + ` is the correct product you want to update?`
    }).then(function(answer) {
        if (answer.productCheck) {
            updateProduct = {
                item_id: object[0].item_id,
                product_name: object[0].product_name,
                department_name: object[0].department_name,
                price: object[0].price,
                stock_quantity: object[0].stock_quantity,
                product_sales: object[0].product_sales
            };
            quantiyNeeded();
        } else {
            productID();
        }
    });
};

function quantiyNeeded() {
    inquirer.prompt({
        name: "quantityNeeded",
        type: "input",
        message: "How many more units would you like to add?",
        // Checks if the product ID entered by the user is a number between 1-10
        validate: (value) => {
            if (!isNaN(value) && value > 0) {
                return true;
            } else {
                console.log(chalk.redBright("Please enter a quantity!"));
                return false;
            }
        }
    }).then(function(answer) {
        updateProduct.quantityNeeded = answer.quantityNeeded;
        connection.query('UPDATE products SET ? WHERE ?', [
            {
                stock_quantity: Number(updateProduct.stock_quantity) + Number(answer.quantityNeeded)
            },
            {
                item_id: updateProduct.item_id
            }
        ], (err, res) => {
            console.log(chalk.blue.bold(`\n\tThe '${updateProduct.product_name}' product from the ${updateProduct.department_name} department now has an available quantity of ${Number(updateProduct.stock_quantity) + Number(updateProduct.quantityNeeded)} units!\n`));
            connection.end();
        });
    });
};