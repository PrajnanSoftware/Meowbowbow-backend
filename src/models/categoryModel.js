import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
    },
    tax: {
        type: Number,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true,
});

const Category = mongoose.model("Category", categorySchema);
export default Category;