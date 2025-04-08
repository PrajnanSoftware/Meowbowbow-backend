import express from 'express';
import { authorise, protect } from '../controllers/userController.js';
import { addCategory, deleteCategory, getAllCategory, updateCategory } from '../controllers/categoryController.js';
import { deleteCategoryImage } from '../controllers/uploadImageController.js';

const router = express.Router();

// Public route
router.get('/', getAllCategory);

// Admin only route
router.post('/', protect, authorise('admin'), addCategory);
router.put('/:id', protect, authorise('admin'), updateCategory);
router.delete('/:id', protect, authorise('admin'), deleteCategory);
router.delete('/deleteImage/:categoryId', protect, authorise('admin'), deleteCategoryImage);

export default router;