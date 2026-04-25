const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

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

const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
