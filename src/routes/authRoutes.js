const express = require('express');
const router = express.Router();
const {
    signup,
    login,
    getMe,
    logout,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes (need authentication)
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/profile', protect, updateProfile);

module.exports = router;