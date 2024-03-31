import express from 'express'
import fs from "fs"
import multer from 'multer'
import Razorpay from 'razorpay'


import { checkUserExist, registerUser, addBook, getAddress, addAddress, updateAddress, deleteAddress, getUserBooks, updateBook, deleteBook, updateUser, fetctBooks, getCount, getTableLength,placeOrder, getUserOrders ,addtocart,checkItemInCart,getCartItems,deleteItem} from './database.js'
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
      console.log(otp)
      sendOTPMail(email, otp, 'OTP for Registration');
      res.status(200).json({
        userExist: true,
        otp: otp
      });


    } else {
      const otp = generateOTP();
      console.log(otp)
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


app.post("/update_user", async (req, res) => {
  try {
    const { userid, name, lasatname, mobileno, city } = req.body
    const user = await updateUser(name, lasatname, mobileno, city, userid)
    res.status(200).json({
      userID: user,
      success: true
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false
    })
  }
})







app.get("/get_address", async (req, res) => {
  try {

    const userid = req.query.userid; // Corrected to use req.query.userid for query parameters

    const address = await getAddress(userid);

    res.status(200).json({ success: true, address: address }); // Sending back the address as a response
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



app.post("/add_address", async (req, res) => {
  try {

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


app.post("/update_address", async (req, res) => {
  try {
    const { aid, country, city, state, pin, near, userid } = req.body
    console.log({ aid, country, city, state, pin, near, userid })
    const address = await updateAddress(aid, country, state, city, pin, near, userid)
    res.status(200).json({
      success: true
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({
      success: false
    })
  }
})

app.delete('/delete_address/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const address = await deleteAddress(id)

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



app.get('/your_book/:id', async (req, res) => {
  try {
    const userid = req.params.id;
    const books = await getUserBooks(userid);
    console.log(books)
    res.status(200).json({ books });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});

app.post("/add_book", upload.single('image'), async (req, res) => {
  try {
    const { bookname, userid, price, description, author, category, image } = req.body;

    // Decode base64 image
    const base64Image = image.split(';base64,').pop();
    const imagePath = `uploadImage/${Date.now()}-${bookname}_${userid}.png`;

    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, async function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error saving image' });
      } else {

        var status = "Listed"
        const book = await addBook(bookname, userid, price, status, description, author, imagePath, category)
        console.log('Image saved successfully:', imagePath);
        res.status(200).json({
          bookname: bookname,
          uID:userid,
          bID:book,
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



app.post("/update_book", upload.single('image'), async (req, res) => {
  try {
    const { bid, bookname, userid, price, description, author, category, image } = req.body;

    // Decode base64 image
    const base64Image = image.split(';base64,').pop();
    const imagePath = `uploadImage/${Date.now()}-${bookname}_${userid}.png`;

    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, async function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Error saving image' });
      } else {
        const book = await updateBook(bid, bookname, userid, price, description, author, imagePath, category)
        console.log('Image saved successfully:', imagePath);
        res.status(200).json({
          uID:userid,
          bID:bid,
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


app.delete('/delete_book/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const address = await deleteBook(id)

    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});



app.get('/get_feed', async (req, res) => {
  try {
    var lastbookid = req.query.lastbookid;
    if (!lastbookid || lastbookid == 0) {
      const bookLength = await getCount()
      const tablelength = await getTableLength()
      lastbookid = bookLength
      if (bookLength >= tablelength) {
        var endid = 0

        const books = await fetctBooks(lastbookid, endid)
        res.status(200).json({
          books: books,
          lastbookid: books[books.length - 1].bID
        })
      }
    } else {
      var endid = lastbookid - 8;
      if (endid < 0) {
        endid = 0
      }
      const books = await fetctBooks(lastbookid, endid)
      res.status(200).json({
        books: books,
        lastbookid: books[books.length - 1].bID
      })
    }
  } catch (error) {
    // Handle errors appropriately
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.post("/order", async (req,res)=>{
  try{
    const {bookID,aID,userid,paymentID,paymentStatus} = req.body
    const status = "Order Placed"
    const  order = await placeOrder(bookID,aID,userid,paymentID,paymentStatus,status)
    res.status(200).json({
      success:true,
      orderid:order
    })
  }catch(er){
    console.log(er)
    res.status(500).json({
      success:false
    })
  }
})

app.post("/createOrder",async(req,res)=>{
  try{
   const  {amt} = req.body
   const key_id =  'rzp_test_Zjom8IGzUOcgy1'
    const razorpay = new Razorpay({
      key_id: 'rzp_test_Zjom8IGzUOcgy1',
      key_secret: 'QTCPiD4BPPLsHcVtSN3DsUe4'
    });

    const options = {
      amount: amt,
      currency: 'INR', 
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success:true,
      order:order,
      key:key_id
    })



  }catch(err){
    res.status(500).json({
      error:err,
      success:false
    })
  }
})


app.get('/your_order/:id', async (req, res) => {
  try {
    const userid = req.params.id;
    const orders = await getUserOrders(userid);
    console.log(orders)
    res.status(200).json({ orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to load books' });
  }
});



app.post("/add_to_cart", async (req,res)=>{
  try{
    const {bookID,userid} = req.body
    const alreadyInCart = await checkItemInCart(bookID,userid)
    if(alreadyInCart){
      res.status(200).json({
        success:true
      })
    }
    const  cart = await addtocart(bookID,userid)
    res.status(200).json({
      success:true,
      cartid:cart
    })
  }catch(er){
    console.log(er)
    res.status(500).json({
      success:false
    })
  }
  

})

app.get("/get_cart_items",async(req,res)=>{
  try{
      const userid = req.query.userid
      const cartItems = await getCartItems(userid)
      res.status(200).json({
        cartItems
      })
  }catch(err){

  }
})

app.post("/delete_cart_item", async(req,res)=>{
  try{
    const {userid,bookid} = req.body
    const item = await deleteItem(userid,bookid)
    res.status(200).json({
      success:true
    })
  }catch(er){
    res.status(200).json({
      success:false
    })
  }
})


app.post('/add_cart_order', async(req,res)=>{
  try{

    
    const {userid,paymentID,paymentStatus,aid} = req.body
  
    const cartItems = await getCartItems(userid)

    const status = "Order Placed"
    console.log(cartItems)
    for (const item of cartItems) {
      console.log(item.bID); // Accessing the bID property of each item
      const order = await placeOrder(
        item.bID,
        aid,
        userid,
        paymentID,
        paymentStatus,
        status
      );
    }
    
    res.status(200).json({
      success:true
    })


  }catch(er){
    res.status(500).json({
      success:false
    })
  }
})

app.listen(5000, '0.0.0.0');