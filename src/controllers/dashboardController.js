import { catchAsync } from "../middlewares/errorMiddleware.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import User from "../models/userModel.js";
import AppError from "../utils/appError.js";

const getDateRange = (period) => {
    const now = new Date();
    let startDate = new Date();

    switch(period) {
        case "day":
            startDate.setHours(0, 0, 0, 0);
            break;
        case "week":
            startDate.setDate(now.getDate() - now.getDay());
            startDate.setHours(0, 0, 0, 0);
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case "half-year":
            startDate.setMonth(now.getMonth() - 5);
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
            break;
        case "year":
            startDate = new Date(now.getFullYear(), 0, 1);
            break;

        default:
            startDate = new Date("2000-01-01");
            break;
    }

    return { startDate, endDate: now}
}

export const getDashboardCounts = catchAsync( async (req, res, next) => {
    try {
        const { period } = req.params;
        const { startDate, endDate } = getDateRange(period);

        const totalOrders = await Order.countDocuments( {createdAt: { $gte: startDate, $lte: endDate }} );
        const totalSales = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } }},
            { $group: { _id: null, sales: {$sum: "$totalPrice" }}}
        ]);
        const totalCustomers = await User.countDocuments({ role: "customer" });
        
        return  res.status(200).json({
            totalOrders,
            totalSales: totalSales[0]?.sales || 0,
            totalCustomers,
            period
        });
    } catch (error) {
        return next(new AppError("Internal Server Error", 500))
       
    }
});

export const getSalesOverview = catchAsync( async (req, res) => {
    try {
        const { period } = req.params;
        const { startDate, endDate } = getDateRange(period);

        const salesData = await Order.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate }}},
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }},
                    totalSales: { $sum: "$totalPrice"},
                    orderCount: { $sum: 1 },
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        return res.status(200).json(salesData);
    } catch (error) {
        return next( new AppError("Error fetching sales data", 500));
    }
});

export const serverHealthCheck = catchAsync( async (req, res, next) => {
    try {
        res.status(200).json({
            status: "Healthy",
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            cpuUsage: process.cpuUsage(),
        });
    } catch (error) {
        return next( new AppError("Error fetching server health", 500) );
    }
});

export const lowStockData = catchAsync( async (req, res, next) => {
    try {
        const lowStock = await Product.find({ quantity: {$lt: 5 }, isDeleted: false}).select("name quantity image")

        return res.status(200).json(lowStock);
    } catch (error) {
        return next( new AppError("Error fetching low stock products", 500));
    }
})