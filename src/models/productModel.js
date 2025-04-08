import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    image: [{type: String}],
    sold: {
        type: Number,
        required: true,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
});

const Product = mongoose.model("Product", productSchema);
export default Product;