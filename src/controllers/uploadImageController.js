import { catchAsync } from "../middlewares/errorMiddleware.js";
import { v2 as cloudinary } from 'cloudinary'
import AppError from "../utils/appError.js";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";

export const deleteProductImage = catchAsync( async (req, res, next) => {
    
    
    try {

        const productId = req.params.productId;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return next(new AppError("Please select the image", 400));
        }

        const publicId = imageUrl.split(".")[0];

        await cloudinary.uploader.destroy(`CloudinaryDemo/${publicId}`);

        const product = await Product.findById(productId);
        if (!product) {
            return next(new AppError("Product not found", 400));
        }

        product.image = product.image.filter((img) => img !== imageUrl)
        await product.save();

        return res.status(204).json({
                status: "success",
                message: "Image deleted successfully", 
                images: product.image,
                deletedImage: imageUrl 
        })
    } catch (error) {
        console.error("Get Product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

export const deleteCategoryImage = catchAsync( async (req, res, next) => {
    
    
    try {

        const categoryId = req.params.categoryId;
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return next(new AppError("Please select the image", 400));
        }

        const publicId = imageUrl.split(".")[0];

        await cloudinary.uploader.destroy(`CloudinaryDemo/${publicId}`);

        const category = await Category.findById(categoryId);
        if (!category) {
            return next(new AppError("Product not found", 400));
        }

        category.image =""
        await category.save();

        return res.status(204).json({
                status: "success",
                message: "Image deleted successfully", 
                images: category.image,
                deletedImage: imageUrl 
        })
    } catch (error) {
        console.error("Get Product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});