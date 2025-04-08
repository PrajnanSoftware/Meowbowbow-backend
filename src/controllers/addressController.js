import { validationResult } from "express-validator";
import { catchAsync } from "../middlewares/errorMiddleware.js";
import Address from "../models/addressModel.js";
import AppError from "../utils/appError.js";
import User from "../models/userModel.js";

// @desc    Add address
// @route   POST /api/v1/address
// @access  Private
export const addAddress = catchAsync( async (req, res, next) => {
    const userId = req.user._id;

    try {
        // const errors = validationResult(req);
        // if(!errors.isEmpty()) {
        //     return next(new AppError(errors.array(), 400));
        // }

        const address = await Address.findOne({ user: userId, isDeleted: false });
        const user = await User.findById(userId);
        console.log(user);
        if (address) {
            return next(new AppError("One User can have only one address", 400));
        }

        const {buildingName, street, city, state, country, zipCode, landmark="" } = req.body;

        const newAddress = new Address({
            user: userId,
            fullName: user.name,
            phoneNumber: user.phone,
            buildingName, street, city, state, country, zipCode, landmark
        });

        await newAddress.save();
        return res.status(201).json({ success: true, address: newAddress });
    } catch (error) {
        console.error("Add Address error: ", error);
        return next(new AppError("Internal Server Error", 500));   
    }
});

// @desc    Get address
// @route   GET /api/v1/address
// @access  Private
export const getAddress = catchAsync( async (req, res, next) => {
    try {
        const address = await Address.findOne({ user: req.user._id, isDeleted: false});

        return res.status(200).json({
            status: "success",
            data: address
        });

    } catch (error) {
        console.error("Get Address error: ", error);
        return next(new AppError("Internal Server Error", 500));   
    }
});

// @desc    Update address
// @route   PUT /api/v1/address/:id
// @access  Private
export const updateAddress = catchAsync( async (req, res, next) => {

        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        //     return next(new AppError(errors.array(), 400));
        // }
        console.log(req.params.id)
        if(!req.params.id) {
            return next(new AppError("Bad Request", 400));
        }

        const id = req.params.id;
        const { isDeleted, isDefault, user, ...updateData } = { ...req.body };

    try {
        console.log(await Address.findById(id));
        const updatedAddress = await Address.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        console.log(id);
        console.log(updatedAddress);
        if (!updatedAddress) {
            return next(new AppError("Address not found", 404));
        }

        return res.status(200).json({
            status: "success",
            data: {
                address: updatedAddress
            }
        });
    } catch (error) {
        console.error("Update address error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Delete address
// @route   DELETE /api/v1/address/:id
// @access  Private
export const deleteAddress = catchAsync( async (req, res, next) => {
    
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //     return next(new AppError(errors.array(), 400));
    // }

    if (!req.params.id){
        return next(new AppError("Bad Request", 400));
    }

    try {
        
        const deletedAddress = await Address.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true, runValidators: true });

        if(!deleteAddress) {
            return next(new AppError("Address not found", 404));   
        }

        res.status(200).json({
            status: "success",
            message: "Address deleted successfully"
        });

    } catch (error) {
        console.error("Delete Address error: ", error);
        return next(new AppError("Internal Server Error", 500));
    }

});