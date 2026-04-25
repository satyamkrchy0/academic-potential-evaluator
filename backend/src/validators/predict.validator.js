// predict.validator.js — Matches real student dataset columns
const { body } = require('express-validator');

const predictValidator = [
    body('cgpa')
        .isFloat({ min: 4.5, max: 9.8 })
        .withMessage('CGPA must be between 4.5 and 9.8'),

    body('internships')
        .isInt({ min: 0, max: 3 })
        .withMessage('Internships must be between 0 and 3'),

    body('projects')
        .isInt({ min: 1, max: 6 })
        .withMessage('Projects must be between 1 and 6'),

    body('coding_skills')
        .isInt({ min: 1, max: 10 })
        .withMessage('Coding skills must be between 1 and 10'),

    body('communication_skills')
        .isInt({ min: 1, max: 10 })
        .withMessage('Communication skills must be between 1 and 10'),

    body('aptitude_test_score')
        .isInt({ min: 35, max: 100 })
        .withMessage('Aptitude test score must be between 35 and 100'),

    body('soft_skills_rating')
        .isInt({ min: 1, max: 10 })
        .withMessage('Soft skills rating must be between 1 and 10'),

    body('certifications')
        .isInt({ min: 0, max: 3 })
        .withMessage('Certifications must be between 0 and 3'),

    body('backlogs')
        .isInt({ min: 0, max: 3 })
        .withMessage('Backlogs must be between 0 and 3'),

    body('gender')
        .isIn(['Male', 'Female'])
        .withMessage('Gender must be Male or Female'),

    body('degree')
        .isIn(['B.Tech', 'BCA', 'MCA', 'B.Sc'])
        .withMessage('Degree must be one of: B.Tech, BCA, MCA, B.Sc'),

    body('branch')
        .isIn(['CSE', 'IT', 'ECE', 'ME', 'Civil'])
        .withMessage('Branch must be one of: CSE, IT, ECE, ME, Civil')
];

module.exports = predictValidator;
