import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User Model Schema
const userSchema = new mongoose.Schema(
    {
        name: { 
            type: String,
            required: true,
            minlength: 3,
            trim: true
        },
        role: { 
            type: String,
            enum: ["admin", "customer"],
            default: "customer"
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator: function(v) {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); // Basic email regex
                },
                message: props => `${props.value} is not a valid email address!`
            }
        },
        phone: { 
            type: Number, 
            validate: {
                validator: function(v) {
                    return /^\d{10}$/.test(v); // Basic phone number validation (10 digits)
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        password: {
            type: String, 
            required: true,
            minlength: 8,
        },
        isEmailVerified: { 
            type: Boolean, 
            default: false 
        },
        isPhoneVerified: { 
            type: Boolean, 
            default: false 
        },
        resetToken: { type: String },
        resetTokenExpire: { type: Date },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// User Model
const User = mongoose.model("User", userSchema);
export default User;