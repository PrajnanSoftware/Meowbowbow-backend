import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/paymentController.js';
import { authorise, protect } from '../controllers/userController.js';

const router = express.Router();

router.post('/create-rp-order', protect, authorise('customer'), createRazorpayOrder);
router.post('/verify-rp-payment', protect, authorise('customer'), verifyRazorpayPayment);

export default router;