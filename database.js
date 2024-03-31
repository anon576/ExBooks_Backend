import mysql from 'mysql2'
import dotenv from 'dotenv'
dotenv.config()

const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DATABASE
}).promise()

pool.getConnection()
    .then((connection) => {
        console.log('Database connected!');
        connection.release(); // Release the connection back to the pool
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error.message);
    });

// --------------User Database-----------------

export async function getUserByID(id) {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
        return user.length ? user[0] : null;
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
}


// const verifyToken = (req, res, next) => {
//     const token = req.header('Authorization');

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {
//         const decoded = jwt.verify(token, 'secretKey'); // Replace with your actual secret key
//         req.user = decoded.user;
//         next();
//     } catch (error) {
//         console.error('Error verifying token:', error);
//         res.status(401).json({ message: 'Unauthorized' });
//     }
// };

// export { verifyToken };


const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    const token = authHeader.split(' ')[1]

    // console.log(token)

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // jwt.verify(token, 'yourSecretKey', (err, decoded) => {
    jwt.verify(token, 'yourSecretKey', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        console.log('Decoded Token Payload:', decoded);

        req.user = decoded; // Set user data in the request object
        next();
    });
};

export { verifyToken };

// const verifyToken = async (token) => {
//     console.log(token);

//     if (!token) {
//         throw { status: 401, message: 'Unauthorized: No token provided' };
//     }

//     try {
//         const decoded = await jwt.verify(token, 'yourSecretKey');
//         console.log('Decoded Token Payload:', decoded);

//         if (decoded && decoded.userId) {
//             return decoded.userId;
//         } else {
//             throw { status: 401, message: 'Unauthorized: Invalid token payload' };
//         }
//     } catch (err) {
//         throw { status: 401, message: 'Unauthorized: Invalid token' };
//     }
// };

// export { verifyToken };


export async function deleteUserByID(id) {
    try {
        const [user] = await pool.query('SELECT * FROM users WHERE userID = ?', [id]);
        if (user.length) {
            await pool.query('DELETE FROM users WHERE userID = ?', [id]);
            return user[0];
        } else {
            return null; // User not found
        }
    } catch (error) {
        console.error('Error deleting user by ID:', error);
        throw error;
    }
}


export async function checkUserExist(email) {
    try {

        const [user] = await pool.query('SELECT email FROM users WHERE email = ?', [email]);

        return user[0] !== undefined;
    } catch (error) {
        console.error('Error checking user existence:', error);
        throw error;
    }
}

export async function saveForgetPasswordOtp(email, otp) {
    try {
        // Insert forget password otp 
        const [user] = await pool.query(`UPDATE users SET otp = ${otp} WHERE email = ?`, [email]);
        const userId = user.insertId;

        // Retrieve and return the user by ID
        return getUserByID(userId);
    } catch (error) {
        console.error('Error inserting forget password otp:', error);
        throw error;
    }
}


export async function registerUser(name,lastname,mobileno,city , email) {
    try {

        const [user] = await pool.query('INSERT INTO users (name,lastname,mobile,city,email) VALUES (?, ?, ?, ?,?)', [name,lastname,mobileno,city, email]);

        const userId = user.insertId;

        // Retrieve and return the user by ID
        return userId;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
}

export async function updateUser(name, lasatname, mobileno, city, userid){
    await pool.query(
        `UPDATE users SET name=?, lastname=?, mobile=?, city=? WHERE userID = ?`,
        [name, lasatname, mobileno, city, userid]
    );

    return { success: true, message: "User Data Updated Successfully" };
}

export async function addBook(name,uid,price,status,description,author,image,category){
    const [book] = await pool.query("Insert into booksTable (bookname,author,price,status,uID,description,imagepath,category) Values(?,?,?,?,?,?,?,?)",[name,author,price,status,uid,description,image,category])

    const bookID = book.insertId

    return bookID
}

export async function updateBook(bid,bookname, userid, price, description, author, imagePath, category) {
    try {

        await pool.query(
            `UPDATE booksTable SET bookname=?, uID=?, price=?, description=?, author=?, imagepath=?, category=? WHERE bID = ?`,
            [bookname, userid, price, description, author, imagePath, category,bid]
        );

        return { success: true, message: "User Data Updated Successfully" };
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

export async function getUserBooks(userid){
    try {
        const [books] = await pool.query("SELECT * FROM booksTable WHERE uID = ?", [userid]);
        return books;
      } catch (error) {
        throw error;
      }
}

export async function deleteBook(bid){
    const [address] = await pool.query('DELETE FROM booksTable WHERE bID = ?', [bid]);

    return true
}

export async function getCount(){
    
    const len = await pool.query(`SELECT *
    FROM booksTable
    ORDER BY bID DESC
    LIMIT 1;`)

    return len[0][0]['bID']
}

export async function getTableLength(){
    const len = await pool.query(`SELECT COUNT(*) AS table_length
    FROM booksTable;
    `)

    return len[0][0]['table_length']
}


export async function fetctBooks(startId, endId){
    const query = `SELECT * FROM booksTable WHERE bID <= ? AND bID >= ? ORDER BY bID DESC`;
    const [books] = await pool.query(query, [startId, endId]);
    return books;
}


export async function addAddress(country,state,city,pin,near,userid){
    const [address] = await pool.query( 
        "Insert into address (country,state,city,location,uID,pin) Values(?,?,?,?,?,?)",[country,state,city,near,userid,pin]
    )

    const aid = address.insertId
    

    return aid
}


export async function updateAddress(aid,country, state, city, pin, near, userid) {
    try {

        await pool.query(
            `UPDATE address SET country=?, state=?, city=?, pin=?, location=?, uID=? WHERE aID = ?`,
            [country, state, city, pin, near, userid,aid]
        );

        return { success: true, message: "User Data Updated Successfully" };
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}

export async function getAddress(userid){
    const [address] = await pool.query("select * from address where uID = (?)",[userid])
  

    return address
}

export async function deleteAddress(aid){
    const [address] = await pool.query('DELETE FROM address WHERE aID = ?', [aid]);

    return true
}

export async function placeOrder(bookID, aID, userID, paymentID, paymentStatus, status) {
    const [order] = await pool.query("INSERT INTO orders (bookID, addressID, userID, paymentID, paymentStatus, status) VALUES (?, ?, ?, ?, ?, ?)", [bookID, aID, userID, paymentID, paymentStatus, status]);
    
    return order.insertId;
}


export async function getUserOrders(userid) {
    try {
      const [orders] = await pool.query(`
        SELECT 
          booksTable.bookname,
          booksTable.author,
          booksTable.imagepath,
          booksTable.price,
          address.country,
          address.state,
          address.location,
          address.city,
          address.pin,
          orders.order_date,
          orders.paymentStatus,
          orders.paymentID,
          orders.status
        FROM 
          orders
        JOIN 
          booksTable ON orders.bookID = booksTable.bID
        JOIN 
          address ON orders.addressID = address.aID
        WHERE 
          orders.userID = ?`, [userid]);
  
      return orders;
    } catch (error) {
      throw error;
    }
  }
  

  export async function checkItemInCart(bookID, userid) {
    const [rows] = await pool.query("SELECT * FROM CartItems WHERE bookID = ? AND userID = ?", [bookID, userid]);
    return rows.length > 0; // If rows exist, return true; otherwise, return false
}

export async function addtocart(bookID,userid){
    const [cart] = await pool.query("INSERT INTO CartItems (bookID,userID) VALUES (?, ?)", [bookID, userid]);
    
    return cart.insertId;
}


export async function getCartItems(userid) {
    try {
        const [cartItems] = await pool.query(`
            SELECT CI.CartItemID, B.*, CI.userID
            FROM CartItems CI
            JOIN booksTable B ON CI.bookID = B.bID
            WHERE CI.userID = ?
        `, [userid]);

        return cartItems;
    } catch (error) {
        console.error("Error retrieving cart items:", error);
        throw error;
    }
}


export async function deleteItem(userid,bookid){
    const [item] = await pool.query('DELETE FROM CartItems WHERE userID = ? and bookID', [userid,bookid]);

    return true
}

