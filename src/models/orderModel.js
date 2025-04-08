import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref:'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        totalProductPrice: { type: Number, required: true},
        tax: { type: Number, required: true}
    }],
    shippingAddress: {
        fullName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true },
        landmark: { type: String },},
    totalPrice: { type: Number, required: true, default: 0 },
    paymentInfo: {
        razorpaySignature: { type: String, default: null },
        razorpayPaymentId: { type: String, },
        razorpayOrderId: { type: String, },},
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    orderStatus: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Failed"], default: "Pending" },
    billDetails: {
        invoiceNumber: { type: String, unique: true, required: true },
        subTotal: { type: Number, default: 0 },
        totalTax: { type: Number, default: 0 },
        total: { type: Number, default: 0 }},
    refundId: { type: String, default: null },
},
{
    timestamps: true
});

const Order = mongoose.model("Order", orderSchema);
export default Order;