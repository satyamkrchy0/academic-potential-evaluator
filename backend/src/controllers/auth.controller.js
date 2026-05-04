const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User.model');

/* ── helpers ── */
function makeTransporter() {
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

/* ── register ── */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(409).json({ success: false, message: 'Email exists' });
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, passwordHash });
        const token = jwt.sign({ id: user._id, email, name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ success: true, token, user: { id: user._id, name, email } });
    } catch (err) { next(err); }
};

/* ── login ── */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ success: true, token, user: { id: user._id, name: user.name, email } });
    } catch (err) { next(err); }
};

/* ── getMe ── */
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) { next(err); }
};

/* ── forgotPassword ── */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        // Always respond 200 to prevent user enumeration
        if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });

        // Generate a secure random token
        const rawToken   = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

        user.resetPasswordToken   = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password.html?token=${rawToken}&email=${encodeURIComponent(email)}`;

        const transporter = makeTransporter();
        await transporter.sendMail({
            from:    `"EmployEdge" <${process.env.SMTP_USER}>`,
            to:      email,
            subject: 'Password Reset Request — EmployEdge',
            html: `
                <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0b0f18;color:#e2e8f0;padding:40px;border-radius:12px;">
                    <h2 style="color:#4fffb0;margin-bottom:8px;">⚡ EmployEdge</h2>
                    <h3 style="margin-top:0;">Password Reset</h3>
                    <p>You requested a password reset for your EmployEdge account. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
                    <a href="${resetUrl}"
                       style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#4fffb0,#7b61ff);color:#060810;font-weight:700;border-radius:8px;text-decoration:none;">
                        Reset My Password
                    </a>
                    <p style="color:#718096;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
                    <hr style="border-color:#1e2a3a;margin:24px 0;">
                    <p style="color:#4a5568;font-size:12px;">EmployEdge — AI-powered placement intelligence platform</p>
                </div>
            `
        });

        res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (err) { next(err); }
};

/* ── resetPassword ── */
const resetPassword = async (req, res, next) => {
    try {
        const { token, email, password } = req.body;

        if (!token || !email || !password) {
            return res.status(400).json({ success: false, message: 'Token, email, and new password are required.' });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            email,
            resetPasswordToken:   hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Token is invalid or has expired.' });
        }

        const salt = await bcrypt.genSalt(12);
        user.passwordHash          = await bcrypt.hash(password, salt);
        user.resetPasswordToken    = null;
        user.resetPasswordExpires  = null;
        await user.save();

        res.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
    } catch (err) { next(err); }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };

