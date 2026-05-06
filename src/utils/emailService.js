const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email when capsule unlocks
const sendUnlockEmail = async (userEmail, userName, capsuleTitle, unlockDate) => {
    try {
        const mailOptions = {
            from: `"Time Capsule App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🎉 Your Time Capsule "${capsuleTitle}" is Now Unlocked! 🎉`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #667eea; text-align: center;">🎊 Time Capsule Unlocked! 🎊</h1>
                        <p style="font-size: 18px; color: #333;">Dear <strong>${userName}</strong>,</p>
                        <p style="font-size: 16px; color: #555;">Your wait is finally over!</p>
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h2 style="color: #764ba2; margin: 0;">"${capsuleTitle}"</h2>
                            <p style="color: #666; margin: 10px 0 0 0;">Unlocked on: ${new Date(unlockDate).toLocaleDateString()}</p>
                        </div>
                        <p style="font-size: 16px; color: #555;">Log in to your account to read the message you wrote for yourself!</p>
                        <a href="http://localhost:5000" style="display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 15px;">📦 Open My Vault</a>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message from your Time Capsule App. Your memories are safe with us.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Email Error:', error);
        return false;
    }
};

// Send welcome email on signup
const sendWelcomeEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: `"Time Capsule App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to Time Capsule App! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <div style="background: white; padding: 30px; border-radius: 10px;">
                        <h1 style="color: #667eea; text-align: center;">Welcome to Time Capsule App! 👋</h1>
                        <p style="font-size: 18px; color: #333;">Dear <strong>${userName}</strong>,</p>
                        <p style="font-size: 16px; color: #555;">You've successfully created your Time Capsule account.</p>
                        <p style="font-size: 16px; color: #555;">Start creating memories that will unlock in the future!</p>
                        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #764ba2; margin: 0;">What can you do?</h3>
                            <ul style="color: #666;">
                                <li>📝 Write messages for your future self</li>
                                <li>🖼️ Upload memory photos</li>
                                <li>🔒 Set unlock dates</li>
                                <li>📧 Get email notifications when capsules unlock</li>
                            </ul>
                        </div>
                        <a href="http://localhost:5000" style="display: inline-block; background: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin-top: 15px;">🚀 Get Started</a>
                        <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
                        <p style="font-size: 12px; color: #999; text-align: center;">Start your journey today!</p>
                    </div>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('Welcome Email Error:', error);
        return false;
    }
};

// Send test email
const sendTestEmail = async (userEmail, userName) => {
    try {
        const mailOptions = {
            from: `"Time Capsule App" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Test Email - Time Capsule App',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #667eea;">Hello ${userName}! 👋</h1>
                    <p>This is a test email to confirm that your email configuration is working correctly.</p>
                    <p>If you received this, your email setup is perfect!</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('Test Email Error:', error);
        return false;
    }
};

module.exports = { sendUnlockEmail, sendWelcomeEmail, sendTestEmail };