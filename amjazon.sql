drop database if exists amjazon;

CREATE database amjazon;

use amjazon;

create table Products (
    ID INT NOT NULL,
    Name VARCHAR(50),
    Discription VARCHAR(100),
    Category INT NOT NULL,
    Price float(10, 3),
    Stock int,
    primary key (ID)
);

create table ProductCategories (
    ID INT NOT NULL,
    Name varchar(50),
    primary key (ID)
);

create table Customers (
    ID INT auto_increment,
    UserName varchar(50),
    password varchar(25),
    primary key(ID)
);

create table Orders (
    OrderID int,
    CustomerID int,
    totalPrice FLoat(10, 3),
    primary key(OrderID)
);

create table OrderItems (
    ID int auto_increment,
    OrderID int,
    PorductID int,
    QuantityOrdered int,
    TotalPrice float,
    primary key(ID)
);