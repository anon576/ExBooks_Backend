import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const admin = process.env.admin
const adminPassword = process.env.adminPassword





// -----------------Mail function---------------------

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.email,
        pass: process.env.password,
    },
})


export const sendOTPMail = (email, otp, subject) => {
    const mailOptions = {
        from: 'codestream63@gmail.com',
        to: email,
        subject: subject,
        text: `Your OTP for registration is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};



export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };



// -------------------Admin function--------------------
export const checkAdmin = (username,password)=>{
    if(username == admin & password == adminPassword){
        return true
    }
    return false
}







