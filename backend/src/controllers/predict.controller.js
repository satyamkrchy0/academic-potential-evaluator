const mlService = require('../services/ml.service');
const llmService = require('../services/llm.service');
const Prediction = require('../models/Prediction.model');
const { prisma } = require('../config/db.postgres');

const createPrediction = async (req, res, next) => {
    try {
        const { cgpa, internships, projects, coding_skills, communication_skills,
                aptitude_test_score, soft_skills_rating, certifications, backlogs,
                gender, degree, branch } = req.body;
        const userId = req.user.id;
        
        const mlResult = await mlService.getPrediction({
            cgpa, internships, projects, coding_skills, communication_skills,
            aptitude_test_score, soft_skills_rating, certifications, backlogs,
            gender, degree, branch
        });

        let explanation = null;
        try {
            explanation = await llmService.explainPrediction(mlResult, req.body);
        } catch (e) { console.warn('LLM unavailable'); }

        const predictionDoc = await Prediction.create({
            userId,
            inputData: { cgpa, internships, projects, coding_skills, communication_skills,
                        aptitude_test_score, soft_skills_rating, certifications, backlogs,
                        gender, degree, branch },
            result: mlResult,
            explanation
        });

        try {
            await prisma.predictionLog.create({
                data: {
                    userId: userId.toString(),
                    employmentProb: mlResult.placement_probability,
                    readinessScore: mlResult.placement_score,
                    predictionLabel: mlResult.prediction,
                    confidence: mlResult.confidence
                }
            });
        } catch (e) { console.warn('Prisma log failed'); }

        req.io.to(userId.toString()).emit('prediction:complete', {
            predictionId: predictionDoc._id,
            result: mlResult
        });

        res.status(201).json({ 
            success: true, 
            predictionId: predictionDoc._id, 
            data: { 
                result: mlResult, 
                ai_explanation: explanation 
            } 
        });
    } catch (err) { next(err); }
};

module.exports = { createPrediction };
