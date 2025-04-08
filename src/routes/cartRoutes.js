import express from "express";
import { authorise, protect } from "../controllers/userController.js";
import { addToCart, checkoutCart, getCart, removeFromCart } from "../controllers/cartController.js";


const router = express.Router();

router.post("/", protect, authorise('customer'), addToCart);
router.get("/", protect, authorise('customer'), getCart);
router.delete("/", protect, authorise('customer'), removeFromCart);
router.post("/checkout", protect, authorise('customer'), checkoutCart);    // TODO: Testing is not completed



export default router;