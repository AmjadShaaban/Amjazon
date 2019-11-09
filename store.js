const cTable = require("console.table");
var inquirer = require("inquirer");
var mysql = require("mysql");
var loggedInUser = null;
let totalPrice = 0;
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "amjazon"
});

function customer(ID, name) {
  this.ID = ID;
  this.name = name;
  this.UID = Math.floor(1000 + Math.random() * 9000);
}
let loginMenu = () => {
  inquirer
    .prompt([{
      type: "list",
      message: "Main menu:",
      choices: ["Login", "Sign Up", "View Products", "Exit"],
      name: "choice"
    }])
    .then(inquiry => {
      switch (inquiry.choice) {
        case "Login": {
          login();
        }
        break;
      case "Sign Up": {
        signup();
      }
      break;
      case "View Products": {
        readProducts(loggedInUser);
      }
      break;
      default: {
        connection.end();
        console.log("¯\\_(ツ)_/¯¯\\_(ツ)_/¯¯\\_(ツ)_/¯");
      }
      break;
      }
    });
};
let loggedInMenu = loggedInUser => {
  inquirer
    .prompt([{
      type: "list",
      message: "Welcome, " + loggedInUser.name,
      choices: ["View/Order Products", "Order History", "Logout", "Exit"],
      name: "choice"
    }])
    .then(inquiry => {
      switch (inquiry.choice) {
        case "View/Order Products": {
          readProducts(loggedInUser);
        }
        break;
      case "Logout": {
        console.log("logged out");
        loginMenu();
      }
      break;
      default: {
        connection.end();
        console.log("¯\\_(ツ)_/¯¯\\_(ツ)_/¯¯\\_(ツ)_/¯");
      }
      break;
      }
    });
};
let signup = () => {
  inquirer
    .prompt([{
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
      connection.query("SELECT * FROM Customers", function (err, res) {
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
          let sqlTodo = [{
            UserName: inquiry.userName,
            password: inquiry.password
          }];
          console.log(sqlStmt + "\n" + sqlTodo);
          connection.query(sqlStmt, sqlTodo, (err, results, fields) => {
            if (err) {
              return console.error(err.message);
            }
            console.log("SUCCESS!!\n Your Customer ID: " + results.insertId);
            let ID = results.insertId;
            let userName = inquiry.userName;
            loggedInUser = new customer(ID, userName);
            loggedInMenu(loggedInUser);
          });
        }
      });
    });
};
let login = () => {
  inquirer
    .prompt([{
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
      connection.query("SELECT * FROM Customers", function (err, res) {
        if (err) throw err;
        let checker = false;
        for (var i = 0; i < res.length; i++) {
          if (inquiry.userName === res[i].UserName) {
            if (inquiry.password === res[i].password) {
              checker = true;
              ID = res[i].ID;
              userName = inquiry.userName;
            }
          }
        }
        if (checker) {
          console.log("Success!");
          loggedInUser = new customer(ID, userName);
          loggedInMenu(loggedInUser);
        } else {
          console.log("User not found");
          loginMenu();
        }
      });
    });
};
let placeOrder = loggedInUser => {
  inquirer
    .prompt([{
        type: "input",
        message: "Enter Product ID:",
        name: "ID"
      },
      {
        type: "input",
        message: "Quantity needed:",
        name: "quantity"
      },
      {
        type: "confirm",
        message: "\tY = submit / N = cancel",
        name: "confirm"
      }
    ])
    .then(inquiry => {
      connection.query("SELECT * FROM Products", function (err, resp) {
        if (err) throw err;
        console.table(inquiry);
        console.table(resp);
        if (inquiry.confirm) {
          for (var i = 0; i < resp.length; i++) {
            if (resp[i].ID === parseInt(inquiry.ID)) {
              totalPrice += resp[i].Price * parseInt(inquiry.quantity);
              console.log(totalPrice);
              let stock = resp[i].Stock;
              let sqlStmt = "INSERT INTO OrderItems SET ?";
              let sqlTodo = {
                OrderID: loggedInUser.UID,
                PorductID: parseInt(inquiry.ID),
                QuantityOrdered: parseInt(inquiry.quantity),
                TotalPrice: totalPrice
              };
              connection.query(sqlStmt, sqlTodo, (err, results, fields) => {
                if (err) {
                  return console.error(err.message);
                } else {
                  console.log("SUCCESS!!");
                  let quantity = stock - parseInt(inquiry.quantity);
                  let stmt = "UPDATE Products SET ? WHERE ?";
                  let todo = [{
                      Stock: quantity
                    },
                    {
                      ID: parseInt(inquiry.ID)
                    }
                  ];
                  connection.query(stmt, todo, (err, result, fields) => {
                    if (err) {
                      return console.error(err.message);
                    } else {
                      console.log("SUCCESS!!");
                      placeOrder(loggedInUser);
                    }
                  });
                }
              });
            }
          }
        } else {
          stmt = "INSERT INTO Orders SET ?";
          todo = {
            OrderID: loggedInUser.UID,
            CustomerID: loggedInUser.ID,
            totalPrice: totalPrice
          };
          connection.query(stmt, todo, (err, result, fields) => {
            if (err) {
              return console.error(err.message);
            } else {
              console.log("SUCCESS!!");
              console.table(result);
            }
          });
        }
      });
    });
};
let readProducts = loggedInUser => {
  connection.query("SELECT * FROM Products", function (err, res) {
    if (err) throw err;
    console.table(res);
    if (typeof loggedInUser !== null) {
      placeOrder(loggedInUser);
    }
  });
};
connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");

  console.log(
    "\n***Welcome to AMJAZON The High Heaven's corner store***\n\n'It's called AMERICAN DREAM'\n'Because you have be asleep to believe it!'\n\tR.I.P. ♥︎ George Carlin︎ ♥︎\n"
  );

  loginMenu();
});