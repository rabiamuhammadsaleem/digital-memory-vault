const Capsule = require('../models/Capsule');
const User = require('../models/User');
const { sendUnlockEmail } = require('../utils/emailService');

// Check and unlock capsules
const checkAndUnlockCapsules = async () => {
    try {
        const now = new Date();
        
        // Find capsules that should be unlocked (by date, not by status field)
        const capsulesToUnlock = await Capsule.find({
            unlockDate: { $lte: now },
            isDeleted: false
        });
        
        console.log(`🔍 Found ${capsulesToUnlock.length} capsules to unlock at ${now.toLocaleString()}`);
        
        for (const capsule of capsulesToUnlock) {
            // Check if already unlocked by comparing dates
            const isAlreadyUnlocked = capsule.status === 'unlocked';
            
            if (!isAlreadyUnlocked) {
                // Update capsule status - bypass validation for this update
                capsule.status = 'unlocked';
                await capsule.save({ validateBeforeSave: false });
                
                // Get user details
                const user = await User.findById(capsule.userId);
                
                if (user && user.email) {
                    // Send email notification
                    await sendUnlockEmail(
                        user.email,
                        user.name,
                        capsule.title,
                        capsule.unlockDate
                    );
                    console.log(`📧 Email sent to ${user.email} for capsule: ${capsule.title}`);
                } else {
                    console.log(`❌ User not found for capsule: ${capsule._id}`);
                }
            }
        }
        
        if (capsulesToUnlock.length > 0) {
            console.log(`✅ Successfully unlocked ${capsulesToUnlock.length} capsules`);
        }
        
        return capsulesToUnlock.length;
    } catch (error) {
        console.error('Unlock Service Error:', error);
        return 0;
    }
};

// Run every hour
const startUnlockService = () => {
    console.log('🚀 Email Unlock Service Started');
    console.log('⏰ Checking for unlocked capsules every hour...');
    
    // Run immediately on start
    checkAndUnlockCapsules();
    
    // Then run every hour
    setInterval(checkAndUnlockCapsules, 60 * 60 * 1000);
};

// Manual trigger function
const manualUnlockCheck = async () => {
    console.log('🔄 Manual unlock check triggered...');
    return await checkAndUnlockCapsules();
};

module.exports = { startUnlockService, checkAndUnlockCapsules, manualUnlockCheck };