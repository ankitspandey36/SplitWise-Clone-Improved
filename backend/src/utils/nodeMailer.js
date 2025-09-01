import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()

console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? "Loaded ✅" : "Missing ❌");


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "chadcam132@gmail.com",
        pass: process.env.GMAIL_PASS,
    },
});

export default transporter