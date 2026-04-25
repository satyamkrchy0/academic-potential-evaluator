const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const Prediction = require('../models/Prediction.model');

router.get('/', authMiddleware, async (req, res, next) => {
    try {
        const predictions = await Prediction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(20);
        res.json(predictions);
    } catch (err) { next(err); }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
    try {
        const pred = await Prediction.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!pred) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
});

module.exports = router;
