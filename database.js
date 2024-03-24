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

export async function addBook(name,uid,price,status,description,author,image,category){
    const [book] = await pool.query("Insert into booksTable (bookname,author,price,status,uID,description,imagepath,category) Values(?,?,?,?,?,?,?,?)",[name,author,price,status,uid,description,image,category])

    const bookID = book.insertId

    return bookID
}

export async function addAddress(country,state,city,pin,near,userid){
    const [address] = await pool.query( 
        "Insert into address (country,state,city,location,uID,pin) Values(?,?,?,?,?,?)",[country,state,city,near,userid,pin]
    )

    const aid = address.insertId
    

    return aid
}

export async function getAddress(userid){
    const [address] = await pool.query("select * from address where uID = (?)",[userid])
  

    return address
}

export async function checkOtp(email) {
    try {
        const [result] = await pool.query('SELECT otp FROM users WHERE email = ?', [email]);

        if (result.length === 0) {
            return null; // OTP not found
        } else {
            return result[0].otp;
        }
    } catch (error) {
        console.error('Error in verifyOtp function:', error);
        throw error;
    }
}

export async function deleteOtp(otp) {
    try {

        const [result] = await pool.query('UPDATE users SET otp = NULL WHERE otp = ?', [otp]);


    } catch (error) {
        console.error('Error in verifyOtp function:', error);
        throw error;
    }
}

export async function setVerify(email) {
    try {
        const [result] = await pool.query('UPDATE users SET verify = "True" WHERE email = ?', [email]);

    } catch (error) {
        console.error('Error in updating to verify function:', error);
        throw error;
    }
}

export async function checkVerified(email) {
    try {
        const [result] = await pool.query('SELECT verify FROM users WHERE email = ?', [email]);

        // Check if the result exists and if the 'verify' field is truthy (e.g., not null or undefined)
        return result.length > 0 && result[0].verify;

    } catch (error) {
        console.error('Error in checkVerified function:', error);
        throw error;
    }
}


export async function deleteUnverified(email) {
    try {

        const [result] = await pool.query('DELETE FROM users WHERE email = ?', [email]);

    } catch (error) {
        console.error('Error in deleteUnverified function:', error);
        throw error;
    }
}


// export async function updateUserData(id, name, email, college, address, dob, mobile) {
//     try {
//         // const hashedPassword = await bcrypt.hash(password, 10);
//         await pool.query(
//             `UPDATE users SET name=?, email=?, college=?, address=?, dob=?, mobile=? WHERE userID = ?`,
//             [name, email, college, address, dob, mobile, id]
//         );

//         // Return the updated user data
//         const updatedUser = await getUserByID(id);
//         return { message: "User Data Updated Successfully", user: updatedUser };
//     } catch (error) {
//         console.error('Error updating user data:', error);
//         throw error;
//     }
// }


export async function updateUserData(id, name, college, address, dob, mobile) {
    try {
        // const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            `UPDATE users SET name=?, college=?, address=?, dob=?, mobile=? WHERE userID = ?`,
            [name, college, address, dob, mobile, id]
        );

        // Return the updated user data
        const updatedUser = await getUserByID(id);
        return { success: true, message: "User Data Updated Successfully", user: updatedUser };
    } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
    }
}



function generateAuthToken(userId) {
    const secretKey = 'yourSecretKey'; // Replace with your actual secret key
    return jwt.sign({ userId }, secretKey, { expiresIn: '365d' }); // Adjust the expiration time as needed
}

export async function authenticateUser(email, password) {
    try {
        const isVerified = await checkVerified(email);

        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!user[0]) {
            return { error: 'User not registered' };
        }

        if (!isVerified) {
            return { error: 'User not registered' };
        }

        const passwordMatch = await bcrypt.compare(password, user[0].password);

        if (!passwordMatch) {
            return { error: 'Incorrect password' };
        }

        const userId = user[0].userID;
        const token = generateAuthToken(userId);

        return { user: getUserByID(userId), token };
    } catch (error) {
        console.error('Error logging in user:', error);
        throw error;
    }
}


// Forgot Password
export async function updatePassword(email, newPassword) {
    try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        return { message: 'Password updated successfully' };
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
}







//----------------Admin Internship Adding---------------------


// Add Internship
export async function addInternship(name, price, level, tabDescription, description, imgUrl) {
    try {
        const [internship] = await pool.query(
            `INSERT INTO internships (name, price, level, tabDescription, description, imgURL) VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, level, tabDescription, description, imgUrl]
        );

        return internship.insertId;
    } catch (error) {
        console.error('Error adding internship:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


// Update Internship
export async function updateInternship(id, name, price, level, tabDescription, description, imgurl) {
    try {
        const [internship] = await pool.query(`
            UPDATE internships 
            SET name = ?, price = ?, level = ?, tabDescription = ?, description = ?, imgURL = ?
            WHERE internshipsID = ?`,
            [name, price, level, tabDescription, description, imgurl, id]
        );

        if (internship.affectedRows === 0) {
            throw new Error('Internship not found or no changes were made');
        }

        return { message: 'Internship updated successfully' };
    } catch (error) {
        console.error('Error updating internship:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


// Delate Internship
export async function deleteInternshipByID(id) {
    try {
        const [internship] = await pool.query('DELETE FROM internships WHERE internshipsID = ?', [id]);

        if (internship.affectedRows === 0) {
            throw new Error('Internship not found or already deleted');
        }

        return { message: 'Internship deleted successfully' };
    } catch (error) {
        console.error('Error deleting internship:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



//-------------------Admin Internship Content---------------

// Add internship Content
export async function addContent(title, content, pageNo, internshipID) {
    try {
        const [con] = await pool.query(
            'INSERT INTO internshipContent (title, content, pageNo, internshipsID) VALUES (?, ?, ?, ?)',
            [title, content, pageNo, internshipID]
        );

        return con.insertId;
    } catch (error) {
        console.error('Error adding content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


// Updated Internship Content
export async function updateInternshipContent(id, title, content, pageNo, internshipID) {
    try {
        const [con] = await pool.query(
            'UPDATE internshipContent SET title=?, content=?, pageNo=?, internshipsID=? WHERE icID=?',
            [title, content, pageNo, internshipID, id]
        );

        return { message: 'Internship content updated successfully' };
    } catch (error) {
        console.error('Error updating internship content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


//Read Internship Content
export async function getContent(iID, pageNo) {
    try {
        const [con] = await pool.query(
            'SELECT * FROM internshipContent WHERE internshipsID=? AND pageNo=?',
            [iID, pageNo]
        );

        return con[0];
    } catch (error) {
        console.error('Error getting content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}





//-----------------Read Internships -----------------------


// Get All Internship
export async function getAllInternships() {
    try {
        const [internships] = await pool.query('SELECT * FROM internships');
        return internships;
    } catch (error) {
        console.error('Error getting all internships:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



// Get Specific Internship
export async function getInternshipsByID(id) {
    try {
        const [internships] = await pool.query('SELECT * FROM internships WHERE internshipsID = ?', [id]);
        return internships[0];
    } catch (error) {
        console.error('Error getting internship by ID:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}






//-----------------Read Content -----------------------


// Get All Content
export async function getAllCourses() {
    try {
        const [course] = await pool.query('SELECT * FROM courses');
        return course;
    } catch (error) {
        console.error('Error getting all courses:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



// Get Specific Internship
export async function getCourseByID(id) {
    try {
        const [course] = await pool.query('SELECT * FROM courses WHERE courseID = ?', [id]);
        return course[0];
    } catch (error) {
        console.error('Error getting course by ID:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}









//---------------------For Mailing Certificate------------------

// For offer letter
export async function getTodaysEnrollledInternship() {
    try {
        const todayDate = new Date().toISOString().split('T')[0];
        const [intern] = await pool.query('SELECT * FROM enrolledInternship WHERE DATE(date) = ?', todayDate);
        return intern;
    } catch (error) {
        console.error('Error getting today\'s enrolled internships:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


// For Completion Certificate
export async function getTodaysComplateEnrollledInternship() {
    try {
        const todayDate = new Date().toISOString().split('T')[0];
        const [intern] = await pool.query('SELECT * FROM enrolledInternship WHERE DATE(complateDate) = ?', todayDate);
        return intern;
    } catch (error) {
        console.error('Error getting today\'s completed enrolled internships:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}





//---------------Enrolled Internship ----------------

// Apply for Internship
export async function enrolledInternship(internshipID, userID, progress, offerLetter, complateLetter, complateDate) {
    try {
        const [enrollment] = await pool.query(`
            INSERT INTO enrolledInternship (internshipsID, userID, progress, offerLetter, complateLetter, complateDate)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [internshipID, userID, progress, offerLetter, complateLetter, complateDate]
        );

        return enrollment.insertId;
    } catch (error) {
        console.error('Error enrolling in internship:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



//Update Progress
export async function updateProgress(pageNo, userID, iID) {
    try {
        const [progress] = await pool.query(`
            UPDATE enrolledInternship
            SET progress = ?
            WHERE userID = ? AND internshipsID = ?`,
            [pageNo, userID, iID]
        );

        return { message: 'Progress Updated Successfully' };
    } catch (error) {
        console.error('Error updating progress:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}




// --------------Admin Course Add----------------------
export async function addCourse(name, price, level, tabdescription, description, imgurl) {
    try {
        const [course] = await pool.query(`
            INSERT INTO courses(name, price, level, tabDescription, description, imgurl)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, price, level, tabdescription, description, imgurl]
        );

        return course.insertId;
    } catch (error) {
        console.error('Error adding course:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



export async function updateCourse(id, name, price, level, tabdescription, description, imgurl) {
    try {
        const [course] = await pool.query(`
            UPDATE courses
            SET name = ?, price = ?, level = ?, tabDescription = ?, description = ?, imgURL = ?
            WHERE courseID = ?`,
            [name, price, level, tabdescription, description, imgurl, id]
        );

        return { message: 'Course updated successfully' };
    } catch (error) {
        console.error('Error updating course:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



export async function deleteCourseByID(id) {
    try {
        const [course] = await pool.query(`DELETE FROM courses WHERE courseID = ?`, [id]);
        return course[0];
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



//----------------Admin Course Content----------------


export async function addCourseContent(title, content, pageNo, courseID) {
    try {
        const [con] = await pool.query(`
            INSERT INTO courseContent(title, content, pageNo, courseID)
            VALUES (?, ?, ?, ?)`,
            [title, content, pageNo, courseID]
        );

        return con.insertId;
    } catch (error) {
        console.error('Error adding course content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}




export async function updatecourseContent(id, title, content, pageNo, courseID) {
    try {
        const [con] = await pool.query(`
            UPDATE courseContent
            SET title = ?, content = ?, pageNo = ?, courseID = ?
            WHERE icID = ?`,
            [title, content, pageNo, courseID, id]
        );

        return { message: 'Course content updated successfully' };
    } catch (error) {
        console.error('Error updating course content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



//Read Course Content
export async function getCourseContent(cID, pageNo) {
    try {
        const [con] = await pool.query(`
            SELECT * FROM courseContent
            WHERE courseID = ? AND pageNo = ?`,
            [cID, pageNo]
        );

        if (con.length === 0) {
            throw new Error('No content found for the specified criteria');
        }

        return con[0];
    } catch (error) {
        console.error('Error retrieving course content:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


//------------Course Erollment Not Required --------------

export async function enrolledCourse(courseID, userID, progress, complateLetter, complateDate) {
    try {
        const [enrollment] = await pool.query(`
            INSERT INTO enrolledCourse(courseID, userID, progress, complateLetter, complateDate)
            VALUES (?, ?, ?, ?, ?)`,
            [courseID, userID, progress, complateLetter, complateDate]
        );

        return enrollment.insertId;
    } catch (error) {
        console.error('Error enrolling in course:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



//Update Progress
export async function updateCourseProgress(pageNo, userID, courseID) {
    try {
        const [progress] = await pool.query(`
            UPDATE enrolledCourse
            SET progress = ?
            WHERE userID = ? AND courseID = ?`,
            [pageNo, userID, courseID]
        );

        if (progress.affectedRows === 0) {
            throw new Error('No matching enrollment found for the specified user and course');
        }

        return { message: 'Progress Updated Successfully' };
    } catch (error) {
        console.error('Error updating course progress:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


//--------------Admin Service---------------------


//Add service-------------------------------
export async function addService(name, imgurl, description, tabDescrition) {
    try {
        const [service] = await pool.query(
            'INSERT INTO service (name, imgurl, description, tabDescrition) VALUES (?, ?, ?, ?)',
            [name, imgurl, description, tabDescrition]
        );

        return service.insertId;
    } catch (error) {
        console.error('Error adding service:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}




//Update service------------------------------------
export async function updateService(id, name, imgurl, description, tabDescrition) {
    try {
        const [service] = await pool.query(
            `update service 
            set name = ?, imgurl=?, description=?, tabdescrition=?
            where serviceID = ?`,
            [name, imgurl, description, tabDescrition, id]
        );

        return { message: 'Service updated successfully' };
    } catch (error) {
        console.error('Error updating service:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


//Delate Service----------------------------
export async function deleteServiceByID(id) {
    try {
        const [service] = await pool.query(`delete from service where serviceID = ?`, [id]);
        return service[0];
    } catch (error) {
        console.error('Error deleting service:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


//Apply Service-------------------------------
export async function applyService(email, mobile, serviceType, projectDescription, contactTime, budget, howyouknowus, projectDeadline, contactStyle, userid, serviceid) {
    try {
        const [service] = await pool.query(`
            INSERT INTO serviceApply(
                email, mobile, serviceType, projectDescription, contactTime, budget, howyouknowus, projectDeadline,contactStyle, userID, serviceID
            ) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [email, mobile, serviceType, projectDescription, contactTime, budget, howyouknowus, projectDeadline, contactStyle, userid, serviceid]);

        return service.insertId;
    } catch (error) {
        console.error('Error applying for service:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


export async function getAppliedServiceDataById(userid) {
    try {
        const [serviceData] = await pool.query('SELECT * FROM serviceApply WHERE userID = ?', [userid]);

        return serviceData;
    } catch (error) {
        console.error('Error getting Applied serviceData:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}


export async function getAppliedServiceDataByServiceId(serviceid) {
    try {
        const [serviceData] = await pool.query('SELECT * FROM serviceApply WHERE serviceApplyID = ?', [serviceid]);

        return serviceData;
    } catch (error) {
        console.error('Error getting Applied serviceData by service id:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

export async function getAllServices() {
    try {
        const [service] = await pool.query('SELECT * FROM service');
        return service; // Return the entire array of services
    } catch (error) {
        console.error('Error fetching all services:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}



export async function getServiceByID(id) {
    try {
        const [service] = await pool.query('SELECT * FROM service WHERE serviceID = ?', [id]);

        // Check if the array is not empty before returning the first element
        return service.length > 0 ? service[0] : null;
    } catch (error) {
        console.error('Error fetching service by ID:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}
