// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');

// dotenv.config();

// // Import routes
// const authRoutes = require('./src/routes/authRoutes');
// const capsuleRoutes = require('./src/routes/capsuleRoutes');

// // Import unlock service
// const { startUnlockService } = require('./src/services/unlockService');

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Serve frontend files (YEH FIXED HAI)
// app.use(express.static(path.join(__dirname, 'frontend')));

// // Database connection
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//       console.log('✅ MongoDB Connected Successfully');
//       startUnlockService();
//   })
//   .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// // API Test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Digital Memory Vault API is running!' });
// });

// // DIRECT EMAIL TEST
// app.post('/send-test-email', async (req, res) => {
//     try {
//         const { sendTestEmail } = require('./src/utils/emailService');
        
//         const email = req.body.email || process.env.EMAIL_USER;
//         const name = req.body.name || 'Test User';
        
//         await sendTestEmail(email, name);
//         res.json({ 
//             success: true, 
//             message: `Test email sent to ${email}`,
//             note: email === process.env.EMAIL_USER ? "Email sent to YOUR own email (ENV user)" : "Email sent to provided email"
//         });
//     } catch (error) {
//         console.error('Test email error:', error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/capsules', capsuleRoutes);

// // Frontend routes - SPA support (FIXED - removed '*', using regex)
// app.get(/^\/(?!api).*/, (req, res) => {
//     res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
// });

// // // Start server
// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //   console.log(`🚀 Server running on port ${PORT}`);
// //   console.log(`📱 Frontend available at: http://localhost:${PORT}`);
// //   console.log(`🔗 API available at: http://localhost:${PORT}/api`);
// // });


// const PORT = process.env.PORT || 5000;


// if (process.env.NODE_ENV !== 'production') {
//     app.listen(PORT, () => {
//         console.log(`🚀 Server running on port ${PORT}`);
//     });
// }


// module.exports = app;

// server.js (Vercel version - NO frontend serving)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./src/routes/authRoutes');
const capsuleRoutes = require('./src/routes/capsuleRoutes');
const { startUnlockService } = require('./src/services/unlockService');

const app = express();

// CORS - Allow frontend URL
app.use(cors({
    origin: ['http://localhost:5000', 'hhttps://digital-memory-vault-frontend.vercel.app/'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection (only once)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
      console.log('✅ MongoDB Connected');
      startUnlockService();
  })
  .catch((err) => console.error('❌ MongoDB Error:', err.message));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

// ✅ NO frontend static serving
// ✅ NO catch-all route for SPA

module.exports = app;