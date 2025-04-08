import { catchAsync } from "../middlewares/errorMiddleware.js";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";

// TODO: Add Req Validation for All

// @desc    Create new categories
// @route   POST /api/v1/category
// @access  Private [Admin only]
export const addCategory = catchAsync( async (req, res, next) => {

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    const { name, description, image, tax } = req.body;

    if (!name ) {
        return next(new AppError("Bad Request", 400));
    }

    try {
        const lowerCaseName = name.trim().toLowerCase();
        const existingCategory = await Category.findOne({ name: lowerCaseName, isDeleted: false });

        if (existingCategory) {
            return next(new AppError("Active Categorie already exists", 409));
        }
        // console.log(req.file)
        await Category.create({name: lowerCaseName, description, image, tax });

        return res.status(201).json({
            status: "success",
            message: "Categorie created successfully"
        });

    } catch (error) {
        console.error("Categorie creation error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Get All Categories
// @route   GET /api/v1/category
// @access  Public
export const getAllCategory = catchAsync( async (req, res, next) => {
    try {
        console.log("entered")
        const category = await Category.find({ isDeleted: false });

        if (!category) {
            return next(new AppError("Categories not found", 404))
        }
        console.log("processing")

        return res.status(200).json({
            status: "success",
            data: category
        });
    } catch (error) {
        console.error("Get Categories error:", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Update a categorie
// @route   PUT /api/v1/category/:id
// @access  Private [Admin only]
export const updateCategory = catchAsync( async (req, res, next) => {
    
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    if (!req.params.id){
        return next(new AppError("Bad Request", 400));
    }

    try {

        const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
        
        if (!category) {
            return next(new AppError("Categorie not found", 404));
        }

        // if (req.file.path) {
        //     category.image = req.file.path;
        // }

        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;
        category.image = req.body.image || category.image;
        category.tax = req.body.tax || category.tax;
        
        const updatedCategory = await category.save();

        return res.status(200).json({
            status: "success",
            data: {
                category: updatedCategory
            }
        });

    } catch (error) {
        console.error("Update categories error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Delete a categorie
// @route   DELETE /api/v1/category/:id
// @access  Private [Admin only]
export const deleteCategory = catchAsync( async (req, res, next) => {
    
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    if (!req.params.id){
        return next(new AppError("Bad Request", 400));
    }

    try {

        const category = await Category.findOne({ _id: req.params.id, isDeleted: false });

        if (!category) {
            return next(new AppError("Category not found or already deleted", 404));
        }
        const linkedProduct = await Product.find({category: req.params.id, isDeleted: false});
        console.log(linkedProduct.length)
        if (linkedProduct.length !== 0) {
            return next(new AppError("Cannot delete category. Active products are linked to this category.", 400));
        }
        

        // Soft delete the category
        category.isDeleted = true;
        await category.save();

        return res.status(204).json({
            status: "success",
            message: "Categorie delete successfully",
            data: null
        });

    } catch (error) {
        console.error("Delete categorie error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});
