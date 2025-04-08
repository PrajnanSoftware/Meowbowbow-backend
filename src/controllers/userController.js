import jwt from 'jsonwebtoken';
import { validationResult } from "express-validator"
import User from "../models/userModel.js";
import AppError from '../utils/appError.js';
import { catchAsync } from '../middlewares/errorMiddleware.js';
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from 'nodemailer';
import Cart from '../models/cartModel.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateOTPToken = (contact, otp) => {
    return jwt.sign(
        { contact, otp },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
    );
};

export const sendContactMail = catchAsync( async (req, res, next) => {
    try {
        const { name, email, phone, subject, message, inquiryType } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Name, Email, and Message are required." });
          }
          if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) {
            return res.status(400).json({ error: "Invalid email format." });
          }
          if (phone && !phone.match(/^\d{10}$/)) {
            return res.status(400).json({ error: "Invalid phone number." });
          }

          const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: '465',
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'support@ungagros.com',
            subject: `New Inquiry from ${name} - ${inquiryType}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\nMessage: ${message}`,
          };

          await transporter.sendMail(mailOptions);

          return res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("Error:", error);
        // return res.status(500).json({ error: "Server error, please try again later." });  
        return next(new AppError("Server error, please try again later.", 500)); 
    }
}) 

export const sendOTP = catchAsync( async (req, res, next) => {
    try {
        const { email, type } = req.body;

        const lowerCaseEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: lowerCaseEmail });
        if (existingUser) {
            return next(new AppError("User with this email already exists", 409));
        }

        const otp = generateOTP();
        const otpToken = generateOTPToken(lowerCaseEmail, otp);

        if (type === "email") {
            try {
                console.log("Creting Transport: ");
                const transporter = nodemailer.createTransport({
                    host: 'smtp.hostinger.com',
                    port: '465',
                    secure: true,
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS,
                    },
                });
                console.log("Created Transport: ");
                console.log("Sending Email: ",)
                await transporter.sendMail({
                    from: ` "Ung Agro" ${process.env.EMAIL_USER}`,
                    to: lowerCaseEmail,
                    subject: "Verify your email",
                    text: `Your OTP code is = ${otp}`
                });
                console.log("Sent Email: ",)
            } catch (error) {
                return next(new AppError('Failed to send verification email', 500));
            }
        } else {
            return res.status(400).json({
                status: 'failed',
                message: `${type} is invalid`,
            });
        }

        return res.status(201).json({
            status: 'success',
            message: `OTP sent to ${type}`,
            otpToken,
        });

    } catch (error) {
        console.log(error)
        return next(new AppError("Internal Server error", 500));
    }
});

// @desc    Register a new user
// @route   POST /api/v1/users/register
// @access  Public
export const registerUser = catchAsync( async (req, res, next) => {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return next(new AppError("Invalid Credentials", 400));
    }

    const { name, email, phone, password, otpToken, otp } = req.body;

    if (!name || !email || !phone || !password || !otpToken || !otp) {
        return next(new AppError("Bad Request", 400));
    }

    try {
        // Check if user already exists
        const lowerCaseEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email:lowerCaseEmail });
        if (existingUser) {
            return next(new AppError("User with this email already exists", 409));
        }

        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        if ( decoded.otp !== otp ) {
            return next(new AppError('Invalid OTPs', 400));
        }

        // Create new User
        const user = new User({
            name, email:lowerCaseEmail, phone, password, isEmailVerified: true
        });

        await user.save();
        const cart = new Cart({ user: user._id, items: [] })
        await cart.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set HTTP-Only cookie
        res.cookie(`token`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: "/"
        });

        // Return user data
        return res.status(201).json({
            status: "success",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        return next(new AppError("Internal Server error", 500));
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/users/login
// @access  Public
export const loginUser = catchAsync( async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError("Invalid Credentials", 400));
    }

    const { email, password } = req.body;

    try {

        const lowerCaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowerCaseEmail });
        if (!user) {
            return next(new AppError("Invalid credentials", 401));
        }

        const isMatch = await user.comparePassword(password);
        if(!isMatch) {
            return next(new AppError("Invalid credentials", 401));
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // Set HTTP-Only cookie
        res.cookie(`token`, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            path: '/'
        });

        return res.status(200).json({
            status: "success",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return next(new AppError("Internal Server error", 500));
    }
});

// @desc    Get user profile
// @route   GET /api/v1/users/profile
// @access  Private
export const getUserProfile = catchAsync( async (req, res, next) => {
    try {

        const user = await User.findById(req.user?._id).select("-password");
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        return res.status(200).json({
            status: "success",
            data: {
                user
            }
        });
    } catch (error) {
        console.error("Profile error:", error);
        return next(new AppError("Internal Server error", 500));
    }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateUserProfile = catchAsync( async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array(), 400));
    }

    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        return res.status(200).json({
            status: "success",
            data: {
                user: updatedUser
            }
        });

    } catch (error) {
        console.error("Update error:", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Private
export const logoutUser = (req, res) => {

    if (!req.user || !req.user.role) {
        return res.status(400).json({ message: "User not authenticated" });
    }

    res.clearCookie(`token`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        path: "/",
    });
    
    return res.status(200).json({ message: "Logged out successfully" });
};


// @desc    Delete User
// @route   DELETE /api/v1/users/profile && /api/v1/users/:id
// @access  Private (Admin can delete others)
export const deleteUser = catchAsync( async (req, res, next) => {
    try {
        const user = await User.findById(req.user?._id);

        if (!user) {
            return next(new AppError("User not found", 404));
        }

        // Check if admin is deleting another user
        if (req.params.userId) {

            if (user.role !== 'admin') {
                return next(new AppError("Not authorized to delete other users", 403));
            }

            // Prevent admin from deleting themselves
            if (req.params.userId === (req.user?._id).toString()) {
                return next(new AppError("Admin cannot delete themselves", 400));
            }

            const userToDelete = await User.findById(req.params.userId);
            if (!userToDelete) {
                return next(new AppError("User not found", 404));
            }

            await User.findByIdAndDelete(req.params.userId);
            return res.status(200).json({
                status: "success",
                message: "User deleted successfully",
                data: null 
            });
        };

        // Regular user deleting themselves
        if (req.user?.role === "admin") {
            return next(new AppError("Admin cannot delete themselves", 400));
        }
        await User.findByIdAndDelete(req.user?._id);
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
        });
        return res.status(204).json({
            status: "success",
            message: "Account deleted successfully",
            data: null 
        });

    } catch (error) {
        console.error("Delete error:", error);
        return next(new AppError("Internal Server Error", 500));
    }
});

export const forgotPassword = catchAsync( async (req, res, next) => {
    try {
        const { email } = req.body;

        const lowerCaseEmail = email.toLowerCase();
        const user = await User.findOne({ email: lowerCaseEmail });
        console.log(email)
        console.log(user)
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        console.log(resetToken);
        user.resetToken = resetToken;
        user.resetTokenExpire = Date.now() + 3600000; // 1 hour expiry

        await user.save();
        console.log("updated");

        const transporter = nodemailer.createTransport({
            host: 'smtp.hostinger.com',
            port: '465',
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
        console.log("created")
        const resetLink = `${req.get('origin')}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        });

        return res.status(200).json({status: "success", message: "Password reset link sent to email." });
    } catch (error) {
        console.log(error)
        return next(new AppError("Internal Server Error", 500));
    }
});

export const resetPassword = catchAsync( async (req, res, next) => {
    const {token} = req.params;
    const { password } = req.body;

    try {

        if (!token || !password) {
            return next(new AppError("Bad Request", 400));
        }

        const user = await User.findOne({ resetToken: token, resetTokenExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

       
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpire = undefined;

        await user.save();
        return res.status(200).json({status: "success", message: "Password reset successful" });
    } catch (error) {
        return next(new AppError("Internal Server error", 500));
    }
})

export const verifyOTP = catchAsync( async (req, res, next) => {
    try {
        const { otp, otpToken } = req.body;

        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        if ( decoded.otp !== otp ) {
            return next(new AppError('Invalid OTPs', 400));
        }

        return res.status(200).json({
            status: "success",
            message: "OTP Verified"
        });
    } catch (error) {
        console.error("Update error:", error);
        return next(new AppError("Internal Server Error", 500));
    }
})

export const changePassword = catchAsync( async (req, res, next) => {
    try {
        const { email, password, otp, otpToken } = req.body;

        const user = await User.findOne({email});
        console.log(user);
        if (!user) {
            return next(new AppError("User not found", 4040));
        }
        
        const decoded = jwt.verify(otpToken, process.env.JWT_SECRET);

        if ( decoded.otp !== otp ) {
            return next(new AppError('Invalid OTPs', 400));
        }

        if (password) {
            user.password = password;
        }
        await user.save();

        return res.status(200).json({
            status: "success",
            message: "password changed successfully"
        });

    } catch (error) {
        console.error("Update error:", error);
        return next(new AppError("Internal Server Error", 500));
    }
})
// Middleware to protect routes
export const protect = catchAsync(async (req, res, next) => {
    console.log("Cookies received:", req.cookies);

    const token = req.cookies.token; // Default domain for customer

    console.log(token)
    if (!token) {
        return next(new AppError("You are not logged in! Please log in to get access", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.info("Decoded token:", decoded);

        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return next(new AppError("User not found!", 401));
        }

        next();
    } catch (error) {
        console.error("Auth error:", error);
        return next(new AppError("Invalid token or internal error", 500));
    }
});


// Admin Middleware
export const authorise = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError("User not authenticated", 401));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(new AppError("Access denied", 403));
        }

        next();
    };
};