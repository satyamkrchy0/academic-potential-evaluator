const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const predictValidator = require('../validators/predict.validator');
const validate = require('../middleware/validate.middleware');
const { createPrediction } = require('../controllers/predict.controller');

router.post('/', authMiddleware, predictValidator, validate, createPrediction);

module.exports = router;
