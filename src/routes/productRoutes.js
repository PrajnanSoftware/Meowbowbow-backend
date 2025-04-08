import express from 'express';
import { addProduct, deleteProduct, findProductById, getAllProducts, getFilterProducts, newProducts, searchSuggestions, topSellingProduct, updateProduct } from '../controllers/productController.js';
import { authorise, protect } from '../controllers/userController.js';
import { deleteProductImage } from '../controllers/uploadImageController.js';
// import upload from '../middlewares/imgUploadMiddleware.js';

const router = express.Router();

// Public Route
router.get('/', getFilterProducts);
router.get('/getAll', getAllProducts);
router.get('/findById/:id', findProductById);
router.get('/top-selling', topSellingProduct);
router.get('/new', newProducts);
router.get('/suggestions', searchSuggestions);

// Admin only route
router.post('/', protect, authorise('admin'), addProduct);
router.put('/:id', protect, authorise('admin'), updateProduct);
router.delete('/:id', protect, authorise('admin'), deleteProduct);
router.delete('/deleteImage/:productId', protect, authorise('admin'), deleteProductImage);

export default router;