import { catchAsync } from "../middlewares/errorMiddleware.js";
import Address from "../models/addressModel.js";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";


// @desc    Add Item to Cart
// @route   POST /api/v1/cart
// @access  Private 
export const addToCart = catchAsync( async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        const product = await Product.findById(productId);
        if( !product || product.isDeleted) {
            return next(new AppError("Product not found", 404));
        }

        let cart = await Cart.findOne({ user: userId });

        
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }


        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if(itemIndex > -1) {
            if (product.quantity < (cart.items[itemIndex].quantity + quantity)){ 
                return next(new AppError("Not enough quantity", 404));
            }
            const qty = cart.items[itemIndex].quantity + quantity;
            if(qty <= 0) {
                return next(new AppError("Should have minimum 1 quantity", 404));
            }
            cart.items[itemIndex].quantity = qty;
        } else {
            if (product.quantity <  quantity){ 
                return next(new AppError("Not enough quantity", 404));
            }
            cart.items.push({ product: productId, quantity });
        }

        const updatedCart = await cart.save();
        const savedCart = await updatedCart.populate('items.product');
        return res.status(200).json({ status: "success", savedCart });

    } catch (error) {
        return next(new AppError("Failed to add to cart", 500));
    }
});

// @desc    Get Cart Items
// @route   GET /api/v1/cart
// @access  Private 
export const getCart = catchAsync( async (req, res, next) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) return next(new AppError("Cart is empty", 404));

        return res.status(200).json({ status: "success", cart })
    } catch (error) {
        return next(new AppError("Failed to fetch cart", 500));
    }
});

// @desc    Remove Item from Cart
// @route   DELETE /api/v1/cart
// @access  Private 
export const removeFromCart = catchAsync( async (req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;
        console.log(req.body);
        let cart = await Cart.findOne({ user: userId });
        if (!cart) return next(new AppError("Cart not found", 404));

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        console.log(cart.items)
        const updatedCart = await cart.save();
        const savedCart = await updatedCart.populate('items.product');
        res.status(200).json({ status: "success", savedCart });

    } catch (error) {
        next(new AppError("Failed to remove item", 500));
    }
});

// @desc    Checkout Cart
// @route   POST /api/v1/cart/checkout
// @access  Private 
export const checkoutCart = catchAsync( async (req, res, next) => {
    
    try {
        const userId = req.user._id;
        let cart = await Cart.findOne({ user: userId }).populate({path: "items.product", populate: { path: "category" } });

        console.log(cart);

        if (!cart || cart.items.length === 0) {
            return next(new AppError("Cart is empty or already checked out", 400));
        }

        let total = 0;
        let orderItem = [];
        let totalTax = 0;
        for (let item of cart.items) {
            console.log(item)
            if (!item.product || item.product.isDeleted) {
                return next(new AppError(`Product ${item.product.name} is no longer available`, 400));
            } else {
                if (item.product.quantity < item.quantity) {
                    return next(new AppError(`Product ${item.product.name} is Out of Stock. Available quantity is ${item.product.quantity}`, 400));
                }
                const totalProductPrice = (item.quantity * item.product.sellingPrice);
                console.log(item.product.category)
                const tax = parseFloat((totalProductPrice * ( item.product.category.tax / 100)).toFixed(2));
                total += totalProductPrice;
                totalTax += tax;
                orderItem.push({"product": item.product._id, "quantity": item.quantity, "price": item.product.sellingPrice, "totalProductPrice": totalProductPrice, tax })
            }
        }
        const customerAddress = await Address.findOne({ user: userId, isDeleted: false }, 'fullName phoneNumber street city state country zipCode landmark');
        
        if (!cart) {
            return next(new AppError("Please Add adress before proceeding", 400));
        }

        // const newOrder = await Order.create({
        //     user: userId,
        //     items: orderItem,
        //     shippingAddress: customerAddress,
        //     totalPrice: total,
        //     paymentStatus: "Pending",
        //     orderStatus: "Pending"
        // });
        // TODO: Calculate 

        return res.status(200).json({
            message: "Checkout successful! Proceed to payment.",
            newOrder: {
                user: userId,
                items: orderItem,
                totalPrice: total,
                totalTax
            }
        });

    } catch (error) {
        console.error(error);
        next(new AppError("Internal Server Error", 500));
    }
});