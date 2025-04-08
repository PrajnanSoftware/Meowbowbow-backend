// function to check weather all required env variables are present
import dotenv from "dotenv";

dotenv.config();
const validateEnv = () => {
        
    if (!process.env.MONGO_DB_URI || !process.env.JWT_SECRET || !process.env.PORT || !process.env.SESSION_SECRET) {
        throw new Error("Missing required environment variables.");
    }
};

export default validateEnv;