import cloudinary from "../configs/cloudinary.js";
import { catchAsync } from "../middlewares/errorMiddleware.js";
import Product from "../models/productModel.js";
import AppError from "../utils/appError.js";

// TODO: Add Req Validation for All

// @desc    Create new product
// @route   POST /api/v1/product
// @access  Private [Admin only]
export const addProduct = catchAsync( async (req, res, next) => {

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }
    console.log('Add Product Controller')

    const { name, description, category, quantity, price, sellingPrice, image } = req.body;

    if (!name || !description || !category || !quantity || !price || !sellingPrice) {
        return next(new AppError("Bad Request", 400));
    }


    try {
        // const existingProduct = await Product.findOne({ name, isDeleted: false });

        // if (existingProduct) {
        //     return next(new AppError("Product already exists", 409));
        // }
        // let imageUrls = [];
        // imageUrls = req.files.map(file => file.path);

        // console.log(imageUrls);
        const newProduct = await Product.create({
            name,
            description,
            category,
            quantity,
            price,
            sellingPrice,
            image: image, // Save multiple images
        });
        return res.status(201).json({
            status: "success",
            message: "Product created successfully",
            data: { product: newProduct },
        });

    } catch (error) {
        console.error("Add Product error: ", error);
        console.error("Add Product Imgae Urls: ", imageUrls);

        // if (req.files.length !== 0) {
        //     await Promise.all(
        //         req.files.map((result, index) => {
        //             cloudinary.uploader.destroy(result.filename)
        //         }
        //       )
        //     );
        //   }

        return next(new AppError("Internal Server Error", 500));
    }
});


export const getAllProducts = catchAsync( async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate('category');
        
        if (!products) {
            return next(new AppError("Products not found", 404))
        }
        
        return res.status(200).json({
            status: "success",
            data: products
        });
        
    } catch (error) {
        console.error("Get Product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
})
// @desc    get all products
// @route   GET /api/v1/product
// @access  Public
export const getFilterProducts = catchAsync( async (req, res, next) => {
    try {
        const { name, category, minPrice, maxPrice, page=1, limit=10 } = req.query;

        let filter = { isDeleted: false };

        if (name) {
            filter.name = { $regex: new RegExp(name, "i")}
        }

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const products = await Product.find(filter).populate('category').skip(skip).limit(parseInt(limit));

        const totalProducts = await Product.countDocuments(filter);

        return res.status(200).json({
            status: "success",
            data: products,
            totalPages: Math.ceil(totalProducts / parseInt(limit)),
            currentPage: parseInt(page),
            totalProducts
        }); 

    } catch (error) {
        console.error("Get Product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});


export const findProductById = catchAsync( async (req, res, next) => {
    try {
        const id = req.params.id;

        

        const product = await Product.findById(id);



        return res.status(200).json({
            status: "success",
            data: product,
        }); 

    } catch (error) {
        console.error("Get Product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
})
// @desc    update product
// @route   PUT /api/v1/product/:id
// @access  Private [Admin only]
export const updateProduct = catchAsync( async (req, res, next) => {

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    if(!req.params.id) {
        return next(new AppError("Bad Request", 400));
    }

    const { isDeleted, ...updateData } = { ...req.body };
    try {

        const product = await Product.findOne({ _id: req.params.id, isDeleted: false });

        if (!product) {
            return next(new AppError("Product not found", 404));
        }

        // if (req.files && req.files.length > 0) {
        //     const newImages = req.files.map((file) => file.path);
        //     updateData.image = [...product.image, ...newImages];
        // }


        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators:true });

        if (!updatedProduct) {
            return next(new AppError("Product not found", 404));
        }

        return res.status(200).json({
            status: "success",
            data: {
                product: updatedProduct
            }
        });

    } catch (error) {
        console.error("Update product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    delete product
// @route   DELETE /api/v1/product/:id
// @access  Private [Admin only]
export const deleteProduct = catchAsync( async (req, res, next) => {

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    if (!req.params.id){
        return next(new AppError("Bad Request", 400));
    }

    try {
        
        const deletedProduct = await Product.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true, runValidators:true });

        if (!deletedProduct) {
            return next(new AppError("Product not found", 404));
        }
    
        res.status(200).json({
            status: "success",
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error("Delete product error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});


export const topSellingProduct = catchAsync( async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false }).sort({ sold: -1 }).limit(10);

        return res.status(200).json({
            status: "success",
            data: products,
        });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
});

export const newProducts = catchAsync( async (req, res, next) => {
    try {
        const products = await Product.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(10);

        return res.status(200).json({
            status: "success",
            data: products,
        });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500));
    }
})

export const searchSuggestions = catchAsync( async (req, res, next) => {
    try {
        const { query } = req.query;
        if (!query) return next(new AppError("Query parameter is required", 400));

        const suggestions = await Product.find({
            name: {$regex: query, $options: "i"},
            isDeleted: false
        }).select("name").limit(5);

        return res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        return next( new AppError("Internal Server Error", 500));
    }
})
// TODO: Changed
// @desc    Checkout Cart
// @route   POST /api/v1/cart/checkout
// @access  Private 
// export const checkoutCart = catchAsync( async (req, res, next) => {
    
//     try {
//         const userId = req.user._id;
//         const { items } = req.body;

//         if (!items || items.length === 0) {
//             return next(new AppError("Bad Request", 400));
//         }

//         const checkoutItems = [];
//         let checkoutTotal = 0;

//         for (let item of items) {
//             const product = await Product.findById(item.product._id);
//             if (!product || product.isDeleted) {
//                 return next(new AppError(`Product ${item.product.name} is no longer available`, 400));
//             } else {
//                 if (product.quantity < item.quantity) {
//                     return next(new AppError(`Product ${item.product.name} is Out of Stock. Available quantity is ${item.product.quantity}`, 400));
//                 }
//                 checkoutTotal += (item.quantity * item.product.sellingPrice);
//             }
//             checkoutItems.push(product);
//         }

        

//         // Add Tax and other charges also
        
//         return res.status(200).json({
//             message: "Checkout successful! Proceed to payment.",
//             checkoutItems,
//             checkoutTotal
//         });

//     } catch (error) {
//         next(new AppError("Internal Server Error", 500));
//     }
// });