import express from 'express'
import { addAddress, deleteAddress, getAddress, updateAddress } from '../controllers/addressController.js';
import { authorise, protect } from '../controllers/userController.js';

const router = express.Router();

router.get('/', protect, authorise('customer'), getAddress);
router.post('/', protect, authorise('customer'), addAddress);
router.put('/:id', protect, authorise('customer'), updateAddress);
router.delete('/:id', protect, authorise('customer'), deleteAddress);

export default router;