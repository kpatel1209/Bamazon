const inquirer = require('inquirer');
const mysql = require('mysql');
const Table = require('cli-table'); // allows you to render unicode-aided tables on the command line from your node.js scripts
const chalk = require('chalk'); // adds styling options

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Successful Connection!");
    displayAllProducts();
});

let userChoice = {};

// Function that displays all items for sale, but does not show the quantity available
function displayAllProducts() {
    connection.query("SELECT * FROM products", function(err, res) {
        let productTable = new Table({
            head: ["ID", "PRODUCT", "DEPARTMENT", "PRICE"],
        });
        for (var i = 0; i < res.length; i++) {
            productTable.push([chalk.blue(res[i].ID), res[i].PRODUCT, res[i].DEPARTMENT, chalk.green(`$${res[i].PRICE}`)]);
        }
        console.log(`${productTable.toString()}`);
        connection.end();
    });
};

// Function that asks the user to enter the product ID for the item they want to purchase
function purchaseByID() {
    inquirer.prompt({
        name: "ID",
        type: "input",
        message: "Please enter the ID of the product you would like to purchase today.",
        // Check if the ID entered by user is a number between 1-10
        validate: function(value) {
            if(value > 0 && value <= 10 && !isNaN(value)) {
                return true;
            } else {
                console.log(chalk.red("An ID number between 1-10 is required!"));
                return false;
            }
        }
    }).then(function(answer){
        connection.query("SELECT ID, PRODUCT, DEPARTMENT, PRICE, QTY, SALES FROM products WHERE ?", {ID: answer.ID}, function(err, res){
            // Check with the user if this is the correct product they want to purchase.
            itemCheck(res[0].PRODUCT, res);
        });
    });
};

function itemCheck(product, object) {
    inquirer.prompt({
        name: "itemCheck",
        type: "confirm",
        message: `Is the ` + chalk.red(`'${product}'`) + ` correct?`
    }).then(function(answer) {
        if (answer.itemCheck) {
            userChoice = {
                ID: object[0].ID,
                PRODUCT: object[0].PRODUCT,
                DEPARTMENT: object[0].DEPARTMENT,
                PRICE: object[0].PRICE,
                QTY: object[0].QTY,
                SALES: object[0].SALES
            };
            // Ask how many of the items the user would like to purchase.
            quantityNeeded(userChoice.ID);
        } else {
            purchaseByID();
        }
    });
};

// Function for the quantity needed to purchase by the user
function quantityNeeded(userChoice) {
    inquirer.prompt({
        name: "quantityNeeded",
        type: "input",
        message: "How many do you need?",
        validate: function(value) {
            if (value > 0 && !ifNaN(value)) {
                return true;
            } else {
                console.log()
            }
        }
    })
}