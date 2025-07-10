import express from 'express';
import { param, query } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    getDashboard,
    getUserProfile,
    searchUsers,
    getTokenHistory,
    getApplications
} from '../controllers/userController.js';

const router = express.Router();

// Validation rules
const userIdValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid user ID')
];

const searchValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('role')
        .optional()
        .isIn(['student', 'company'])
        .withMessage('Role must be student or company'),
    query('skills')
        .optional()
        .isString()
        .withMessage('Skills must be a comma-separated string'),
    query('university')
        .optional()
        .isString()
        .withMessage('University must be a string'),
    query('industry')
        .optional()
        .isString()
        .withMessage('Industry must be a string')
];

const applicationQueryValidation = [
    query('status')
        .optional()
        .isIn(['pending', 'accepted', 'rejected', 'withdrawn'])
        .withMessage('Status must be pending, accepted, rejected, or withdrawn'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

// Routes
router.get('/dashboard', authenticate, getDashboard);
router.get('/profile/:id', userIdValidation, getUserProfile);
router.get('/search', searchValidation, searchUsers);
router.get('/tokens/history', authenticate, authorize('student'), getTokenHistory);
router.get('/applications', authenticate, authorize('student'), applicationQueryValidation, getApplications);

export default router; 