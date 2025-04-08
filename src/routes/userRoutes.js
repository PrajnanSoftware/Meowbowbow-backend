import express from 'express';
import { 
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    deleteUser,
    protect,
    sendOTP,
    sendContactMail,
    authorise,
    verifyOTP,
    changePassword,
    forgotPassword,
    resetPassword
} from '../controllers/userController.js';
import { 
    registerUserValidator,
    loginValidator,
    updateProfileValidator
} from '../utils/validators/userValidators.js';

const router = express.Router();

// Public routes
router.post('/register', registerUserValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/generateOTP', sendOTP);
router.post('/contact', sendContactMail);

router.post('/verifyOtp', verifyOTP);
router.post('/changePassword', changePassword);

router.post('/forgot-password', forgotPassword);
router.post('/password-reset/:token', resetPassword);

router.get('/protected-route', protect, (req, res) => {
  res.status(200).json({ message: "You have access!" });
});

// Protected routes
router.post('/logout', protect, logoutUser);
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateProfileValidator, updateUserProfile)
    .delete(protect, authorise('admin'), deleteUser);
// Admin-only route
router.delete('/:userId', protect, authorise('admin'), deleteUser);

export default router;
