import { Router } from "express";
import { authorise, protect } from "../controllers/userController.js";
import { getDashboardCounts, getSalesOverview, lowStockData, serverHealthCheck } from "../controllers/dashboardController.js";

const router = Router();

router.get('/metrics/:period', protect, authorise('admin'), getDashboardCounts);
router.get('/salesOverview/:period', protect, authorise('admin'), getSalesOverview);
router.get('/serverHealth', protect, authorise('admin'), serverHealthCheck);
router.get('/lowStcok', protect, authorise('admin'), lowStockData);

export default router;