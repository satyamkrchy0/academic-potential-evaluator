const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/auth.controller');
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

module.exports = router;
