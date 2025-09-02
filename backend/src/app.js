import express from 'express';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Razorpay from 'razorpay'
import crypto from "crypto";

const app = express();


app.use(cors({
    origin: "https://split-wise-clone-improved.vercel.app/",
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ limit: "16kb" }))
app.use(express.text())
app.use(cookieParser())

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.post("/create-order", async (req, res) => {
  const { amount } = req.body;
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, 
      currency: "INR",
    });
    res.json(order);
  } catch (err) {
    res.status(500).send(err);
  }
});


app.post("/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true, message: "Payment verified" });
  } else {
    res.status(400).json({ success: false, message: "Payment verification failed" });
  }
});

app.post("/razorpay-webhook", express.json({ type: "*/*" }), (req, res) => {
  const secret = process.env.RAZORPAY_SECRET;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  if (digest === req.headers["x-razorpay-signature"]) {
    res.json({ status: "ok" });
  } else {
    res.status(400).send("Invalid signature");
  }
});


//routes
import userRoutes from './routes/user.routes.js';
app.use("/user", userRoutes);
import expenseRoutes from './routes/expense.routes.js';
app.use("/expense", expenseRoutes);
import groupRoutes from './routes/group.routes.js'
app.use("/group",groupRoutes)
export default app;



app.use((err, req, res, next) => {
    const statusCode = err.statuscode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});