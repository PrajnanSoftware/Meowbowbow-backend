import { catchAsync } from "../middlewares/errorMiddleware.js";
import Address from "../models/addressModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";
import crypto from 'crypto';

// TODO: Steps to Place Order
// 1. Go to Cart and click on check out(Frontend) - Fron cart controller proceed to checkout before checking out verify the product and quantity (backend)
// 2. From checkout Page go to Payment (Frontend) - When proceeding to payment generate Order from OrderController or Payment Controller. (backend)
// 3. If Payment successful go to Orders Page (Frontend) - 
// 4. If Payment fails redirects to Checkout Page (Frontend)

// @desc    Create Order
// @route   POST /api/v1/order
// @access  Private 
// TODO: Don't use this controller
export const createOrder = catchAsync( async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { items, totalPrice, orderStatus, paymentInfo, paymentStatus, billDetails } = req.body;

        const shippingAddress = await Address.findOne({user: userId});
        console.log(shippingAddress);

        const invoiceNumber = `INV-${ crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) return next(new AppError(`Product with ID ${item.product} not found`, 404));
            
            if (product.quantity < item.quantity) {
                return next(new AppError(`Not enough stock for ${product.name}`, 400));
            }

            product.quantity -= item.quantity;
            product.sold += item.quantity;
            
            await product.save();
        }

        const newOrder = new Order({
            user: req.user._id,
            items: items,
            shippingAddress,
            totalPrice,
            paymentInfo,
            paymentStatus,
            billDetails: {
                invoiceNumber: invoiceNumber,
                ...billDetails
            },
            orderStatus
        });
        console.log(newOrder);

        await newOrder.save();
        
        await Cart.findOneAndUpdate({ user: req.user._id }, {$set: { items: [] }}, {new: true});

        return res.status(201).json({ status: 'success', order: newOrder });

    } catch (error) {
        console.log(error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Get User Orders
// @route   GET /api/v1/order
// @access  Private 
export const getUserOrders = catchAsync( async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', orders });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Get All Orders
// @route   GET /api/v1/all-order
// @access  Private [Admin Only]
export const getAllOrders = catchAsync( async (req, res, next) => {
    try {
        const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
        return res.status(200).json({ status: 'success', orders })
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));   
    }
});

export const getOrderById = catchAsync( async (req, res, next) => {
    try {
        const id = req.params.id;
        const order = await Order.findById(id).populate('items.product');
        return res.status(200).json({ status: 'success', order })
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
})

// @desc    Update Order Status
// @route   PUT /api/v1/order/:orderId
// @access  Private [Admin Only]
export const updateOrderStatus = catchAsync( async (req, res, next) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const order = await Order.findById(orderId);
        if (!order) return next(new AppError("Order not found", 404));

        order.orderStatus = orderStatus;
        await order.save();

        return res.status(200).json({ status: 'success', order });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));  
    }
});

// @desc    Cancel Order
// @route   PUT /api/v1/order/cancel/:orderId
// @access  Private 
export const cancelOrder = catchAsync( async (req, res, next) => {
    try {

        const { orderId } = req.params;
        const { refundId } = req.body;

        if (!orderId || !refundId) return next(new AppError("Bad Request", 400))

        const order = await Order.findById(orderId);
        if (!order) return next(new AppError("Order not found", 404));

        if (order.paymentStatus !== "Paid") {
            return res.status(400).json({ message: "Order is not paid, cannot refund" });
        }

        if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
            return next(new AppError("Cannot cancel shipped or delivered orders", 400));
        }

        order.refundId = refundId;
        order.orderStatus = "Cancelled";
        await order.save();

        return res.status(200).json({ success: true, message: "Order cancelled and refund successfully" });

    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
})