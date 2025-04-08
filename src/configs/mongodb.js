import mongoose from "mongoose";

// Establish Mongo DB connection
const connectToMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI);
        console.info(`[INFO] MongoDB is Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[ERROR] Error connecting to MongoDB: ${error.message}`)
        process.exit(1);
    }
};

export default connectToMongoDB;