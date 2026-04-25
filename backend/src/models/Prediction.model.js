const mongoose = require('mongoose');
const PredictionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    inputData: {
        cgpa: Number, internships: Number, projects: Number,
        coding_skills: Number, communication_skills: Number,
        aptitude_test_score: Number, soft_skills_rating: Number,
        certifications: Number, backlogs: Number,
        gender: String, degree: String, branch: String
    },
    result: {
        placement_probability: Number,
        placement_score: Number,
        prediction: String,
        confidence: String
    },
    explanation: String
}, { timestamps: true });
module.exports = mongoose.model('Prediction', PredictionSchema);
