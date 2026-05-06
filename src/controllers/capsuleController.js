const Capsule = require('../models/Capsule');

// @desc    Create a new capsule with image upload
// @route   POST /api/capsules
// @access  Private
// @desc    Create a new capsule (with optional image URL from JSON or file upload)
const createCapsule = async (req, res) => {
    try {
        const { title, message, unlockDate, mood, tags, isPublic, location, image } = req.body;
        
        // Parse tags if sent as string
        let parsedTags = tags;
        if (typeof tags === 'string') {
            parsedTags = tags.split(',').map(tag => tag.trim());
        }

        // Validate unlock date
        const unlockDateTime = new Date(unlockDate);
        if (unlockDateTime <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Unlock date must be in the future'
            });
        }

        // Get image URL - priority: file upload > JSON image field
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/${req.file.filename}`;
        } else if (image) {
            imageUrl = image;
        }

        // Create new capsule
        const newCapsule = await Capsule.create({
            userId: req.user._id,
            title: title,
            message: message,
            unlockDate: unlockDateTime,
            mood: mood || 'happy',
            tags: parsedTags || [],
            isPublic: isPublic === 'true' || isPublic === true,
            location: location || null,
            imageUrl: imageUrl
        });

        // Update user's totalCapsules count
        await req.user.updateOne({ $inc: { totalCapsules: 1 } });

        res.status(201).json({
            success: true,
            message: 'Time capsule created successfully! 🎉',
            data: newCapsule
        });
    } catch (error) {
        console.error('Create Capsule Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// const createCapsule = async (req, res) => {
//     try {
//         const { title, message, unlockDate, mood, tags, isPublic, location } = req.body;
        
//         // Parse tags if sent as string
//         let parsedTags = tags;
//         if (typeof tags === 'string') {
//             parsedTags = tags.split(',').map(tag => tag.trim());
//         }

//         // Validate unlock date
//         const unlockDateTime = new Date(unlockDate);
//         if (unlockDateTime <= new Date()) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Unlock date must be in the future'
//             });
//         }

//         // Get image URL if uploaded
//         let imageUrl = null;
//         if (req.file) {
//             imageUrl = `/uploads/${req.file.filename}`;
//         }

//         const capsule = await Capsule.create({
//             userId: req.user._id,
//             title,
//             message,
//             unlockDate: unlockDateTime,
//             mood: mood || 'happy',
//             tags: parsedTags || [],
//             isPublic: isPublic === 'true' || isPublic === true,
//             location: location || null,
//             imageUrl: imageUrl
//         });

//         // Update user's totalCapsules count
//         await req.user.updateOne({ $inc: { totalCapsules: 1 } });

//         res.status(201).json({
//             success: true,
//             message: 'Time capsule created successfully! 🎉',
//             data: capsule
//         });
//     } catch (error) {
//         console.error('Create Capsule Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// @desc    Get all capsules with search & filter
// @route   GET /api/capsules?search=keyword&status=locked
// @access  Private
const getAllCapsules = async (req, res) => {
    try {
        const { search, status } = req.query;
        
        let query = { userId: req.user._id, isDeleted: false };
        
        if (search && search.trim() !== '') {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const now = new Date();
        if (status === 'locked') {
            query.unlockDate = { $gt: now };
        } else if (status === 'unlocked') {
            query.unlockDate = { $lte: now };
        }
        
        const capsules = await Capsule.find(query).sort({ createdAt: -1 });
        
        const processedCapsules = capsules.map(capsule => {
            const capsuleObj = capsule.toObject();
            const isUnlocked = new Date(capsule.unlockDate) <= now;
            
            if (!isUnlocked) {
                return {
                    _id: capsuleObj._id,
                    title: capsuleObj.title,
                    unlockDate: capsuleObj.unlockDate,
                    mood: capsuleObj.mood,
                    imageUrl: capsuleObj.imageUrl,
                    status: 'locked',
                    createdAt: capsuleObj.createdAt
                };
            }
            return { ...capsuleObj, status: 'unlocked' };
        });
        
        res.status(200).json({
            success: true,
            count: processedCapsules.length,
            filters: { search: search || null, status: status || null },
            data: processedCapsules
        });
    } catch (error) {
        console.error('Get All Capsules Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get single capsule by ID
// @route   GET /api/capsules/:id
// @access  Private
// @desc    Get single capsule by ID (for editing)
// @route   GET /api/capsules/:id
// @access  Private
const getCapsuleById = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ 
            _id: req.params.id, 
            userId: req.user._id,
            isDeleted: false 
        });

        if (!capsule) {
            return res.status(404).json({
                success: false,
                message: 'Capsule not found'
            });
        }

        const now = new Date();
        const isUnlocked = new Date(capsule.unlockDate) <= now;

        // Directly return capsule data with status
        const responseData = capsule.toObject();
        responseData.isUnlocked = isUnlocked;
        responseData.canEdit = !isUnlocked;

        res.status(200).json({
            success: true,
            data: responseData
        });
        
    } catch (error) {
        console.error('Get Capsule Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};
// const getCapsuleById = async (req, res) => {
//     try {
//         const capsule = await Capsule.findOne({ 
//             _id: req.params.id, 
//             userId: req.user._id,
//             isDeleted: false 
//         });

//         if (!capsule) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Capsule not found'
//             });
//         }

//         const now = new Date();
//         const isUnlocked = new Date(capsule.unlockDate) <= now;

//         if (!isUnlocked) {
//             return res.status(403).json({
//                 success: false,
//                 message: `This capsule is locked. It will open on ${new Date(capsule.unlockDate).toLocaleDateString()}`,
//                 unlockDate: capsule.unlockDate,
//                 status: 'locked'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             data: capsule,
//             status: 'unlocked'
//         });
//     } catch (error) {
//         console.error('Get Capsule Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// @desc    Update capsule (only before unlock)
// @route   PUT /api/capsules/:id
// @access  Private
const updateCapsule = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ 
            _id: req.params.id, 
            userId: req.user._id,
            isDeleted: false 
        });

        if (!capsule) {
            return res.status(404).json({
                success: false,
                message: 'Capsule not found'
            });
        }

        const now = new Date();
        const isUnlocked = new Date(capsule.unlockDate) <= now;

        if (isUnlocked) {
            return res.status(403).json({
                success: false,
                message: 'Cannot update an unlocked capsule'
            });
        }

        const { title, message, unlockDate, mood, tags, isPublic, location } = req.body;

        if (title) capsule.title = title;
        if (message) capsule.message = message;
        if (unlockDate) {
            const newDate = new Date(unlockDate);
            if (newDate <= now) {
                return res.status(400).json({
                    success: false,
                    message: 'New unlock date must be in the future'
                });
            }
            capsule.unlockDate = newDate;
        }
        if (mood) capsule.mood = mood;
        if (tags) {
            let parsedTags = tags;
            if (typeof tags === 'string') {
                parsedTags = tags.split(',').map(tag => tag.trim());
            }
            capsule.tags = parsedTags;
        }
        if (isPublic !== undefined) capsule.isPublic = isPublic;
        if (location) capsule.location = location;
        
        // Update image if new one uploaded
        if (req.file) {
    capsule.imageUrl = `/uploads/${req.file.filename}`;
} else if (req.body.image) {
    capsule.imageUrl = req.body.image;  // ← YEH LINE HONI CHAHIYE
}

        // if (req.file) {
        //     capsule.imageUrl = `/uploads/${req.file.filename}`;
        // }

        await capsule.save();

        res.status(200).json({
            success: true,
            message: 'Capsule updated successfully',
            data: capsule
        });
    } catch (error) {
        console.error('Update Capsule Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Soft delete capsule (move to trash)
// @route   DELETE /api/capsules/:id
// @access  Private
const deleteCapsule = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ 
            _id: req.params.id, 
            userId: req.user._id,
            isDeleted: false 
        });

        if (!capsule) {
            return res.status(404).json({
                success: false,
                message: 'Capsule not found'
            });
        }

        capsule.isDeleted = true;
        capsule.deletedAt = new Date();
        await capsule.save();

        await req.user.updateOne({ $inc: { totalCapsules: -1 } });

        res.status(200).json({
            success: true,
            message: 'Capsule moved to trash. It can be restored within 30 days.'
        });
    } catch (error) {
        console.error('Delete Capsule Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Restore deleted capsule
// @route   POST /api/capsules/:id/restore
// @access  Private
const restoreCapsule = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({ 
            _id: req.params.id, 
            userId: req.user._id,
            isDeleted: true 
        });

        if (!capsule) {
            return res.status(404).json({
                success: false,
                message: 'Deleted capsule not found'
            });
        }

        capsule.isDeleted = false;
        capsule.deletedAt = null;
        await capsule.save();

        await req.user.updateOne({ $inc: { totalCapsules: 1 } });

        res.status(200).json({
            success: true,
            message: 'Capsule restored successfully',
            data: capsule
        });
    } catch (error) {
        console.error('Restore Capsule Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get dashboard statistics
// @route   GET /api/capsules/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
    try {
        const now = new Date();
        
        const totalCapsules = await Capsule.countDocuments({
            userId: req.user._id,
            isDeleted: false
        });
        
        const lockedCapsules = await Capsule.countDocuments({
            userId: req.user._id,
            isDeleted: false,
            unlockDate: { $gt: now }
        });
        
        const unlockedCapsules = await Capsule.countDocuments({
            userId: req.user._id,
            isDeleted: false,
            unlockDate: { $lte: now }
        });
        
        const deletedCapsules = await Capsule.countDocuments({
            userId: req.user._id,
            isDeleted: true
        });
        
        const nextCapsule = await Capsule.findOne({
            userId: req.user._id,
            isDeleted: false,
            unlockDate: { $gt: now }
        }).sort({ unlockDate: 1 }).select('title unlockDate mood');
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const weeklyStreak = await Capsule.countDocuments({
            userId: req.user._id,
            isDeleted: false,
            createdAt: { $gte: sevenDaysAgo }
        });
        
        const recentCapsules = await Capsule.find({
            userId: req.user._id,
            isDeleted: false
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title unlockDate mood imageUrl createdAt');
        
        const processedRecent = recentCapsules.map(capsule => {
            const capsuleObj = capsule.toObject();
            const isUnlocked = new Date(capsule.unlockDate) <= now;
            return {
                ...capsuleObj,
                status: isUnlocked ? 'unlocked' : 'locked'
            };
        });
        
        res.status(200).json({
            success: true,
            data: {
                totalCapsules,
                lockedCapsules,
                unlockedCapsules,
                deletedCapsules,
                nextCapsule: nextCapsule || { message: 'No locked capsules! All are unlocked.' },
                streak: {
                    weekly: weeklyStreak,
                    message: weeklyStreak > 0 ? `🔥 ${weeklyStreak} capsules this week!` : 'Create a capsule to start your streak!'
                },
                recentCapsules: processedRecent
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get countdown for a capsule
// @route   GET /api/capsules/:id/countdown
// @access  Private
const getCountdown = async (req, res) => {
    try {
        const capsule = await Capsule.findOne({
            _id: req.params.id,
            userId: req.user._id,
            isDeleted: false
        });

        if (!capsule) {
            return res.status(404).json({
                success: false,
                message: 'Capsule not found'
            });
        }

        const now = new Date();
        const unlockDate = new Date(capsule.unlockDate);
        
        if (unlockDate <= now) {
            return res.status(200).json({
                success: true,
                status: 'unlocked',
                message: '🎉 This capsule is already unlocked! 🎉',
                data: {
                    title: capsule.title,
                    unlockDate: unlockDate,
                    isUnlocked: true
                }
            });
        }
        
        const timeDiff = unlockDate - now;
        
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (86400000)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (3600000)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (60000)) / 1000);
        
        let message = '';
        if (days > 0) {
            message = `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            message = `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
        } else if (minutes > 0) {
            message = `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''} remaining`;
        } else {
            message = `${seconds} second${seconds > 1 ? 's' : ''} remaining`;
        }
        
        res.status(200).json({
            success: true,
            status: 'locked',
            data: {
                _id: capsule._id,
                title: capsule.title,
                unlockDate: unlockDate,
                imageUrl: capsule.imageUrl,
                isUnlocked: false,
                remaining: {
                    days,
                    hours,
                    minutes,
                    seconds,
                    totalSeconds: Math.floor(timeDiff / 1000)
                },
                message: `⏰ ${message}`,
                fullMessage: `"${capsule.title}" will unlock on ${unlockDate.toLocaleDateString()}! ${message}`
            }
        });
        
    } catch (error) {
        console.error('Countdown Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    createCapsule,
    getAllCapsules,
    getCapsuleById,
    updateCapsule,
    deleteCapsule,
    restoreCapsule,
    getDashboardStats,
    getCountdown
};