import { body } from "express-validator";

export const registerUserValidator = [
    body("name").trim().escape().isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phone").trim().matches(/^\d{10}$/).withMessage("Phone number must be exactly 10 digits"),
    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number"),
];

export const loginValidator = [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required").isLength({ min: 8 }).withMessage("Password must be at least 8 character long"),
];

export const updateProfileValidator = [
    body("name").optional().trim().escape().notEmpty().withMessage("Name cannot be empty").isLength({ min: 3 }).withMessage("Name must be at least 3 character long"),
    body("phone").optional().trim().isMobilePhone().withMessage("Valid phone number is required"),
    body("email").optional().trim().isEmail().withMessage("Valid email is required"),
];
