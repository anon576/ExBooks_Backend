import express from 'express'
import fs from "fs"
import multer from 'multer'


import { checkUserExist, registerUser, addBook, getAddress, addAddress } from './database.js'
import { sendOTPMail, generateOTP, checkAdmin } from './utils.js'


const app = express()
app.use(express.json({ limit: '50mb' }));
app.use('/uploadImage', express.static('uploadImage'));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploadImage/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Register user----------------------------
app.post('/join', async (req, res) => {
  try {
    const { email } = req.body;
    const emailExists = await checkUserExist(email);
    if (emailExists) {
      const otp = generateOTP();
      sendOTPMail(email, otp, 'OTP for Registration');
      res.status(200).json({
        userExist: true,
        otp: otp
      });


    } else {
      const otp = generateOTP();
      sendOTPMail(email, otp, 'OTP for Registration');
      res.status(200).json({
        message: 'OTP sent to your email for verification',
        userExist: false,
        otp: otp
      });
    }


  } catch (error) {
    console.error('Error in registration:', error);
    res.status(500).json({
      message: 'Internal Server Error',
    });
  }
});

app.post("/register_user", async (req, res) => {
  try {
    const { name, lasatname, mobileno, city, email } = req.body
    const user = await registerUser(name, lasatname, mobileno, city, email)
    res.status(200).json({
      userID: user,
      success: true
    })

  } catch (error) {

    res.status(500).json({
      success: false
    })
  }
})

app.post("/add_address", async (req, res) => {
  try {
    console.log("here")
    const { country, city, state, pin, near, userid } = req.body
    const address = await addAddress(country, state, city, pin, near, userid)
    res.status(200).json({
      addressId: address,
      success: true
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false
    })
  }
})








app.post("/add_book", upload.single('image'), async (req, res) => {
  try {
    console.log("working");
    const { bookname, userid, price, description, author, category, image } = req.body;
    const status = "On Sale";

    // Decode base64 image
    const base64Image = image.split(';base64,').pop();
    const imagePath = `uploadImage/${Date.now()}-${bookname}_${userid}.png`;

    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, async function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error saving image' });
      } else {

        const book = await addBook(bookname, userid, price, status, description, author, imagePath, category)
        console.log('Image saved successfully:', imagePath);
        res.status(200).json({
          bookname: bookname,
          price: price,
          description, description,
          author: author,
          image: `http://192.168.43.192:5000/${imagePath}`,
          category: category,
          boodID: book,
          success: true
        });
      }
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.get("/get_address", async (req, res) => {
  try {

    const userid = req.query.userid; // Corrected to use req.query.userid for query parameters

    const address = await getAddress(userid);
    console.log(address)

    res.status(200).json({ success: true, address }); // Sending back the address as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});


app.get('/get', async (req, res) => {
  res.status(200).json({
    msg: "working"
  })
})
// app.listen(() => {
//     console.log(`http://192.168.43.192:5000`);
//   });

app.listen(5000, '192.168.43.192');