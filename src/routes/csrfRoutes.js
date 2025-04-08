import { Router } from "express";
import csrfTokenController from "../controllers/csrfTokenController.js";
import csrf_protection from "../utils/csrfProtection.js";
import { catchAsync } from "../middlewares/errorMiddleware.js";

/**
 * 
 * here link controller to route
 */

const csrfRoutes = Router();

csrfRoutes.get("/get-csrf-token", csrfTokenController.getCsrfToken);

/**
 * send token through header as  CSRF-TOKEN
 */
csrfRoutes.post('/csrf-test', catchAsync( async (req, res, next) => {
    res.json({ message: 'POST request successful!' });
}));

export default csrfRoutes;