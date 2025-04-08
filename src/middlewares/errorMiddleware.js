import AppError from "../utils/appError.js"

// if the endpoint is not found then this function will throw AppError
export const notFoundHandler = (req, res, next) => {
    next( new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
    
    // Set default values to unknown errors
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Handle Mongoose/MongoDB Errors
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') {
        const message = `Invalid ${error.path}: ${error.value}`;
        error = new AppError(message, 400);
    }

    if (error.code === 11000) {
        const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
        const message = `Duplicate field value: ${value}. Please use another value!`;
        error = new AppError(message, 400);
    }

    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        const message = `Invalid input data. ${messages.join('. ')}`;
        error = new AppError(message, 400);
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        error = new AppError('Invalid token. Please log in again!', 401);
    }

    if (error.name === 'TokenExpiredError') {
        error = new AppError('Your token has expired! Please log in again!', 401);
    }

    // Log error details
    if (process.env.NODE_ENV === 'development') {
        console.error('[ERROR] ', error);
        sendErrorDev(error, req, res);
    } else {
        sendErrorProd(error, req, res);
    }
};

// Development error response
const sendErrorDev = (err, req, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

// Production error response
const sendErrorProd = (err, req, res) => {
    // Operational errors: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } 
    // Programming errors: don't leak details
    else {
        console.error('[ERROR] ', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!'
        });
    }
};

// centralized error handling controller
export const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};