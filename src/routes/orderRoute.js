import express from 'express'
import { authorise, protect } from '../controllers/userController.js';
import { cancelOrder, createOrder, getAllOrders, getOrderById, getUserOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.post('/', protect, authorise('customer'), createOrder);

router.get('/', protect, getUserOrders);
router.get('/all-order', protect, authorise('admin'), getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:orderId', protect, authorise('admin'), updateOrderStatus);
router.put('/cancel/:orderId', protect, cancelOrder);

export default router;