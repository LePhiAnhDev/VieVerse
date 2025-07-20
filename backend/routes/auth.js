import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
    register,
    login,
    getProfile,
    verifyloginOTP,
    resendOTP,
    verifyEmailLink,
    updateProfile,
    changePassword,
    connectWallet
} from '../controllers/authController.js';

const router = express.Router();

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('role')
        .optional()
        .isIn(['student', 'company'])
        .withMessage('Role must be either student or company'),
    // Student specific validation
    body('university')
        .if(body('role').equals('student'))
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('University name is required for students'),
    body('major')
        .if(body('role').equals('student'))
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Major is required for students'),
    body('skills')
        .if(body('role').equals('student'))
        .optional()
        .isArray()
        .withMessage('Skills must be an array'),
    // Company specific validation
    body('company_name')
        .if(body('role').equals('company'))
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name is required for companies'),
    body('industry')
        .if(body('role').equals('company'))
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Industry is required for companies'),
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Please provide a valid phone number')
];

const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .matches(/^[0-9+\-\s()]+$/)
        .withMessage('Please provide a valid phone number'),
    body('university')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('University name must be between 2 and 100 characters'),
    body('major')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Major must be between 2 and 100 characters'),
    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array'),
    body('company_name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Company name must be between 2 and 100 characters'),
    body('industry')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Industry must be between 2 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be less than 1000 characters'),
    body('website')
        .optional()
        .isURL()
        .withMessage('Please provide a valid website URL')
];

const changePasswordValidation = [
    body('current_password')
        .notEmpty()
        .withMessage('Current password is required'),
    body('new_password')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Routes
router.post('/register', registerValidation, register);
router.get('/verify-email', verifyEmailLink);
router.post('/login', loginValidation, login);
router.post('/verify-login-OTP', verifyloginOTP);
router.post('/resend-otp', resendOTP);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/change-password', authenticate, changePasswordValidation, changePassword);
router.put('/connect-wallet', authenticate, [
    body('wallet_address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Please provide a valid Ethereum address')
], connectWallet);

export default router; 