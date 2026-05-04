const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');

router.post('/register', [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    validate
], register);

router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty(),
    validate
], login);

router.get('/me', authMiddleware, getMe);

router.post('/forgot-password', [
    body('email').isEmail().withMessage('A valid email is required.'),
    validate
], forgotPassword);

router.post('/reset-password', [
    body('token').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
    validate
], resetPassword);

module.exports = router;

