const mongoose = require('mongoose');

const capsuleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    imageUrl: {
        type: String,
        default: null
    },
    videoUrl: {
        type: String,
        default: null
    },
    unlockDate: {
        type: Date,
        required: [true, 'Unlock date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Unlock date must be in the future'
        }
    },
    mood: {
        type: String,
        enum: ['happy', 'sad', 'excited', 'confused', 'romantic', 'motivated', 'grateful', 'angry', 'peaceful', 'hopeful'],
        default: 'happy'
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['locked', 'unlocked'],
        default: 'locked'
    },
    location: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update karte waqt updatedAt auto update ho
capsuleSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

module.exports = mongoose.model('Capsule', capsuleSchema);