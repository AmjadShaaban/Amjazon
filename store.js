const cTable = require('console.table');
var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "amjazon"
});
let loginMenu = () => {
    inquirer.prompt([{
        type: "list",
        message: "Main menu:",
        choices: [
            "Login",
            "Sign Up",
            "View Products",
            "Exit"
        ],
        name: "choice"
    }]).then((inquiry) => {
        switch (inquiry.choice) {
            case "Login": {
                console.log("Login Query");
            }
            case "Sign Up": {
                console.log("Sign up Query");
            }
            case "View Products": {
                readProducts();
                break;
            }
            default: {
                connection.end();
                console.log("¯\\_(ツ)_/¯¯\\_(ツ)_/¯¯\\_(ツ)_/¯");
                break;
            }

        }
    })
}
let loggedInMenu = () => {
    inquirer.prompt([{
        type: "list",
        message: "Welcome, " + userName,
        choices: [
            "View/Order Products",
            "Order History",
            "Logout",
            "Exit"
        ],
        name: "choice"
    }]).then((inquiry) => {
        switch (inquiry.choice) {
            case "Login": {
                console.log("Login Query");
            }
            case "Sign Up": {
                console.log("Sign up Query");
            }

        }
        console.log(inquiry.choice + " mysql db work here!")
    })
}
let readProducts = () => {
    console.log("Viewing products...\n");
    connection.query("SELECT * FROM Products", function (err, res) {
        if (err) throw err;

        console.table(res);
        console.log("Please Login to place an order");
        loginMenu();
    });
}
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");



    var userName = null;


    console.log("\n***Welcome to AMJAZON The High Heaven's corner store***\n\n'It's called AMERICAN DREAM'\n'Because you have be asleep to believe it!'\n\tR.I.P. ♥︎ George Carlin︎ ♥︎\n");





    // let productsMenu = () => {

    // }
    if (userName === null) {
        loginMenu();
    } else {
        loggedInMenu();
    }
});