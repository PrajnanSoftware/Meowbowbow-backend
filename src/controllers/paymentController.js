import Razorpay from 'razorpay';
import { catchAsync } from '../middlewares/errorMiddleware.js';
import crypto from 'crypto';
import Order from '../models/orderModel.js';
import AppError from '../utils/appError.js';
import Product from '../models/productModel.js';
import Cart from '../models/cartModel.js';


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

export const createRazorpayOrder = catchAsync( async (req, res, next) => {
    try {

        // find the total from cart items
        const userId = req.user._id;
        const { amount } = req.body;

        const options = {
            amount: Math.round(parseFloat(amount) * 100), // Amount in paisa
            currency: "INR",
            receipt: `order_rcptid_${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
            payment_capture: 1, // Auto-capture payment
        };
        console.log("RP Options")
        console.log(options)
        razorpay.orders.create(options, (error, order) => {
            if (error) {
                console.log(error);
                return next(new AppError("Something went wrong", 500));
            }
            console.log(order);
            return res.status(200).json({ success: true, data: order });
        });

    } catch (error) {
        console.log(error);
        return next(new AppError("Internal Server Error", 500));
    }
});

export const verifyRazorpayPayment = catchAsync( async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return next(new AppError("Invalid signature, payment failed", 400));
        }


        return res.status(200).json({ success: true, message: "Payment verified.", data: {razorpay_order_id, razorpay_payment_id, razorpay_signature} });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
});