const express = require('express');
const router = express.Router();
const {
    createCapsule,
    getAllCapsules,
    getCapsuleById,
    updateCapsule,
    deleteCapsule,
    restoreCapsule,
    getDashboardStats,
    getCountdown
} = require('../controllers/capsuleController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// All routes are protected (require login)
router.use(protect);

// Dashboard stats
router.get('/stats/dashboard', getDashboardStats);

// Countdown route
router.get('/:id/countdown', getCountdown);

// Capsule CRUD routes with image upload
router.route('/')
    .post(upload.single('image'), createCapsule)
    .get(getAllCapsules);

router.route('/:id')
    .get(getCapsuleById)
    .put(upload.single('image'), updateCapsule)
    .delete(deleteCapsule);

router.post('/:id/restore', restoreCapsule);

// Serve uploaded images
const path = require('path');
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

module.exports = router;