import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import validateEnv from './utils/validateEnv.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';
// import MongoStore from 'connect-mongo';
// import mongoose from "mongoose";
// import csrf_protection from './utils/csrfProtection.js';
// import session from 'express-session';
import userRoutes from './routes/userRoutes.js';
import csrfRoutes from './routes/csrfRoutes.js';
import categoryRoute from './routes/categoryRoutes.js';
import productRoute from './routes/productRoutes.js';
import cartRoute from './routes/cartRoutes.js';
import addressRoute from './routes/addressRoute.js';
import orderRoute from './routes/orderRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import dashboardRoute from './routes/dashboardRoute.js';
import connectToMongoDB from './configs/mongodb.js';

// Access config and validate the config file
dotenv.config();
validateEnv();

// Express App setup/configuration
const app = express();

// Middlewares
app.use(cors({
  origin: function (origin, callback) {
    console.log(origin);
    if (!origin) callback(null, true);
    
    const allowedOrigins = process.env.CORS_ALLOWED?.split(',').map(o => o.trim()) || [];
    
    console.log(allowedOrigins);
    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'], // Ensure these headers are allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight requests
}));

app.use(helmet());
app.use(cookieParser()); 
app.use(bodyParser.json()); // Json Parsing
app.use(bodyParser.urlencoded({ extended: true })); //URL-Encoded parsing

  // /csrf protection 
  // app.use(csrf_protection);
  // Routes
  app.get('/', (req, res) => {
      return res.status(200).json({message: "connected"});
  });
  
  app.use('/api/v1/users', userRoutes);
  app.use("/api/v1/security", csrfRoutes);
  app.use("/api/v1/category", categoryRoute);
  app.use("/api/v1/product", productRoute);
  app.use("/api/v1/cart", cartRoute);
  app.use("/api/v1/address", addressRoute);
  app.use("/api/v1/payment", paymentRoute);
  app.use("/api/v1/order", orderRoute);
  app.use("/api/v1/dashboard", dashboardRoute);

  // Unhandled exception and errors processing
  app.use(notFoundHandler);
  app.use(errorHandler);

export default app;