const cTable = require("console.table");
var inquirer = require("inquirer");
var mysql = require("mysql");
var userName = null;
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "amjazon"
});

let loginMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Main menu:",
        choices: ["Login", "Sign Up", "View Products", "Exit"],
        name: "choice"
      }
    ])
    .then(inquiry => {
      switch (inquiry.choice) {
        case "Login":
          {
            login();
          }
          break;
        case "Sign Up":
          {
            signup();
          }
          break;
        case "View Products":
          {
            readProducts();
            console.log("Please login to order.");
            loginMenu();
          }
          break;
        default:
          {
            connection.end();
            console.log("¯\\_(ツ)_/¯¯\\_(ツ)_/¯¯\\_(ツ)_/¯");
          }
          break;
      }
    });
};
let loggedInMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Welcome, " + userName,
        choices: ["View/Order Products", "Order History", "Logout", "Exit"],
        name: "choice"
      }
    ])
    .then(inquiry => {
      switch (inquiry.choice) {
        case "View/Order Products":
          {
            readProducts();
            console.log("Placing order function here!");
            placeOrder();
          }
          break;
        case "Logout":
          {
            console.log("logged out");
            loginMenu();
          }
          break;
        default:
          {
            connection.end();
            console.log("¯\\_(ツ)_/¯¯\\_(ツ)_/¯¯\\_(ツ)_/¯");
          }
          break;
      }
    });
};
let signup = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter a username:",
        name: "userName"
      },
      {
        type: "password",
        message: "Enter a password:",
        mask: "*",
        name: "password"
      }
    ])
    .then(inquiry => {
      console.log("Creating account...");
      connection.query("SELECT * FROM Customers", function(err, res) {
        if (err) throw err;
        let exists = false;
        for (var i = 0; i < res.length; i++) {
          if (inquiry.userName === res[i].UserName) {
            exists = true;
          }
        }
        if (exists) {
          console.log(
            "Sorry Username: " +
              inquiry.userName +
              " Already exists!\nSign up using different Username."
          );
          signup();
        } else {
          let sqlStmt = "INSERT INTO Customers SET ?";
          let sqlTodo = [
            {
              UserName: inquiry.userName,
              password: inquiry.password
            }
          ];
          console.log(sqlStmt + "\n" + sqlTodo);
          connection.query(sqlStmt, sqlTodo, (err, results, fields) => {
            if (err) {
              return console.error(err.message);
            }
            console.log("SUCCESS!!\n Your Customer ID: " + results.insertId);
            userName = inquiry.userName;
            loggedInMenu();
          });
        }
      });
    });
};
let login = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter your username:",
        name: "userName"
      },
      {
        type: "password",
        message: "Enter your password:",
        mask: "*",
        name: "password"
      }
    ])
    .then(inquiry => {
      console.log("Checking credintials...");
      connection.query("SELECT * FROM Customers", function(err, res) {
        if (err) throw err;
        let checker = false;
        for (var i = 0; i < res.length; i++) {
          if (inquiry.userName === res[i].UserName) {
            if (inquiry.password === res[i].password) {
              checker = true;
            }
          }
        }
        if (checker) {
          userName = inquiry.userName;
          console.log("Success!");
          loggedInMenu();
        } else {
          console.log("User not found");
          loginMenu();
        }
      });
    });
};
let placeOrder = () => {
  inquirer
    .prompt([
      {
        type: "input",
        message: "Enter Product ID:",
        name: "ID"
      },
      {
        type: "input",
        message: "Quantity needed:",
        name: "quantity"
      }
    ])
    .then(inquiry => {
      connection.query("SELECT * FROM Products", function(err, res) {
        if (err) throw err;
        let checker = false;
        var orderUID = Math.floor(1000 + Math.random() * 9000);
        for (var i = 0; i < res.length; i++) {
          if (res[i].ID === inquiry.ID) {
            TotalPrice = res[i].Price * inquiry.quantity;
            console.log(TotalPrice);
            let sqlStmt = "INSERT INTO OrderItems SET ?";
            let sqlTodo = [
              {
                OrderItemID: orderUID,
                OrderID: userName,
                ProductID: inquiry.ID,
                QuantityOrdered: inquiry.quantity,
                TotalPrice: TotalPrice
              }
            ];
            connection.query(sqlStmt, sqlTodo, (err, results, fields) => {
              if (err) {
                return console.error(err.message);
              }
              console.log("SUCCESS!!");
              let quantity = res[i].Stock - inquiry.quantity;
              console.log(quantity);
              let stmt = "UPDATE Products SET ? WHERE ?";
              let todo = [{ Stock: quantity }, { ID: inquiry.ID }];
              connection.query(stmt, todo, (err, result, fields) => {
                if (err) {
                  return console.error(err.message);
                }
                console.log("SUCCESS!!");
              });
            });
          }
        }
        console.log(res[0].ID);
      });
    });
};
let readProducts = () => {
  console.log("Viewing products...\n");
  connection.query("SELECT * FROM Products", function(err, res) {
    if (err) throw err;

    console.table(res);
  });
};
connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");

  console.log(
    "\n***Welcome to AMJAZON The High Heaven's corner store***\n\n'It's called AMERICAN DREAM'\n'Because you have be asleep to believe it!'\n\tR.I.P. ♥︎ George Carlin︎ ♥︎\n"
  );

  // let productsMenu = () => {

  // }
  loginMenu();
});
