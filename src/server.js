import app from "./app.js";
import connectToMongoDB from "./configs/mongodb.js";

const PORT = process.env.PORT || 8080;

// Connect to DB
connectToMongoDB();

// Start the Express server
const server = app.listen(PORT, () => {
    console.info(`[INFO] Server running in ${process.env.NODE_ENV} and PORT: ${PORT}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', err => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(err);
    process.exit(1);
});

// Handle unhandled rejections
process.on('unhandledRejection', err => {
    console.error('UNHANDLED REJECTION! Shutting down...');
    console.error(err);
    server.close(() => process.exit(1));
});