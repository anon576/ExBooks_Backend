create table users(
userID integer primary key auto_increment,
name varchar(50) not null,
lastname varchar(50) not null,
email varchar(50) not null,
city varchar(75) not null,
date timestamp not null default now(),
address varchar(150),
mobile integer
);


create table booksTable( 
    bID integer primary key auto_increment,
    bookname varchar(150) not null,
    author varchar(150),
    price integer,
    status varchar(20),
    uID integer,
    description varchar(1000),
    imagepath varchar(50),
    category varchar(30)
);


create table address( 
    aID integer primary key auto_increment,
    country varchar(150) not null,
    state varchar(150),
    city varchar(150),
    pin integer,
    uID integer,
    location varchar(1000)
);


CREATE TABLE orders (
    orderID INTEGER PRIMARY KEY AUTO_INCREMENT,
    userID INTEGER,
    bookID integer,
    addressID integer,
    order_date TIMESTAMP NOT NULL DEFAULT NOW(),
    paymentStatus varchar(20),
    paymentID varchar(20),  
    status VARCHAR(20)
);




CREATE TABLE CartItems (
    CartItemID INT PRIMARY KEY AUTO_INCREMENT,
    userID INT NOT NULL,
    bookID INT NOT NULL
);
