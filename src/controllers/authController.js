// const User = require('../models/User');
// const jwt = require('jsonwebtoken');

// // JWT Token Generate Karo
// const generateToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRE || '7d'
//     });
// };

// // @desc    User Signup
// // @route   POST /api/auth/signup
// // @access  Public
// const signup = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check karo agar user already exist karta hai
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User already exists with this email'
//             });
//         }

//         // Naya user create karo
//         const user = await User.create({
//             name,
//             email,
//             password
//         });

//         if (user) {
//             res.status(201).json({
//                 success: true,
//                 message: 'User created successfully',
//                 data: {
//                     _id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     totalCapsules: user.totalCapsules,
//                     token: generateToken(user._id)
//                 }
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid user data'
//             });
//         }
//     } catch (error) {
//         console.error('Signup Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // @desc    User Login
// // @route   POST /api/auth/login
// // @access  Public
// const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Check karo email aur password
//         const user = await User.findOne({ email }).select('+password');

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         // Password match karo
//         const isPasswordMatch = await user.comparePassword(password);

//         if (!isPasswordMatch) {
//             return res.status(401).json({
//                 success: false,
//                 message: 'Invalid email or password'
//             });
//         }

//         res.status(200).json({
//             success: true,
//             message: 'Login successful',
//             data: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 totalCapsules: user.totalCapsules,
//                 token: generateToken(user._id)
//             }
//         });
//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // @desc    Get Current User Profile
// // @route   GET /api/auth/me
// // @access  Private
// const getMe = async (req, res) => {
//     try {
//         const user = await User.findById(req.user._id);
//         res.status(200).json({
//             success: true,
//             data: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 totalCapsules: user.totalCapsules,
//                 createdAt: user.createdAt
//             }
//         });
//     } catch (error) {
//         console.error('GetMe Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // @desc    Logout User (frontend side se token delete karna)
// // @route   POST /api/auth/logout
// // @access  Private
// const logout = async (req, res) => {
//     try {
//         // JWT stateless hai, isliye sirf success message bhejna hai
//         // Frontend token delete kar lega
//         res.status(200).json({
//             success: true,
//             message: 'Logged out successfully'
//         });
//     } catch (error) {
//         console.error('Logout Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// // @desc    Update Profile
// // @route   PUT /api/auth/profile
// // @access  Private
// const updateProfile = async (req, res) => {
//     try {
//         const { name, password } = req.body;
//         const user = await User.findById(req.user._id);

//         if (name) {
//             user.name = name;
//         }

//         if (password) {
//             user.password = password;
//         }

//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: 'Profile updated successfully',
//             data: {
//                 _id: user._id,
//                 name: user.name,
//                 email: user.email,
//                 totalCapsules: user.totalCapsules
//             }
//         });
//     } catch (error) {
//         console.error('UpdateProfile Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };

// module.exports = {
//     signup,
//     login,
//     getMe,
//     logout,
//     updateProfile
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/emailService');

// JWT Token Generate Karo
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// @desc    User Signup
// @route   POST /api/auth/signup
// @access  Public
// const signup = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // Check missing fields
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Please provide name, email and password'
//             });
//         }

//         // Check karo agar user already exist karta hai
//         const userExists = await User.findOne({ email });
//         if (userExists) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'User already exists with this email'
//             });
//         }

//         // Naya user create karo
//         const user = await User.create({
//             name,
//             email,
//             password
//         });

//         if (user) {
//             res.status(201).json({
//                 success: true,
//                 message: 'User created successfully',
//                 data: {
//                     _id: user._id,
//                     name: user.name,
//                     email: user.email,
//                     totalCapsules: user.totalCapsules,
//                     token: generateToken(user._id)
//                 }
//             });
//         } else {
//             res.status(400).json({
//                 success: false,
//                 message: 'Invalid user data'
//             });
//         }
//     } catch (error) {
//         console.error('Signup Error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Server error',
//             error: error.message
//         });
//     }
// };
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        if (user) {
            // Send welcome email (don't await - fire and forget)
            sendWelcomeEmail(user.email, user.name).catch(err => 
                console.error('Welcome email failed:', err)
            );
            
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    totalCapsules: user.totalCapsules,
                    token: generateToken(user._id)
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    User Login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Check karo email aur password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Password match karo
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                totalCapsules: user.totalCapsules,
                token: generateToken(user._id)
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                totalCapsules: user.totalCapsules,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('GetMe Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Logout User (frontend side se token delete karna)
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    try {
        // JWT stateless hai, isliye sirf success message bhejna hai
        // Frontend token delete kar lega
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Update Profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update name
        if (name) {
            user.name = name;
        }

        // Update email - check for duplicate
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already in use by another account'
                });
            }
            user.email = email;
        }

        // Update password
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }
            user.password = password;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                totalCapsules: user.totalCapsules
            }
        });
    } catch (error) {
        console.error('UpdateProfile Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    login,
    getMe,
    logout,
    updateProfile
};