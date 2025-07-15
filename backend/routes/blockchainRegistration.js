import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import {
    registerStudent,
    registerCompany,
    verifyCompany,
    getPendingRegistrations,
    getUserRegistrationStatus
} from '../controllers/blockchainController.js';

const router = express.Router();

// Validation rules
const registerStudentValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên phải từ 2 đến 100 ký tự'),
    body('skills')
        .optional()
        .isArray()
        .withMessage('Kỹ năng phải là một mảng'),
    body('address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Địa chỉ ví không hợp lệ')
];

const registerCompanyValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên công ty phải từ 2 đến 100 ký tự'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Mô tả không được quá 1000 ký tự'),
    body('address')
        .matches(/^0x[a-fA-F0-9]{40}$/)
        .withMessage('Địa chỉ ví không hợp lệ')
];

const verifyCompanyValidation = [
    body('registrationId')
        .isUUID()
        .withMessage('ID đăng ký không hợp lệ'),
    body('action')
        .isIn(['approve', 'reject'])
        .withMessage('Hành động phải là approve hoặc reject'),
    body('rejectionReason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Lý do từ chối không được quá 500 ký tự')
];

// Routes
router.post('/student/register', authenticate, registerStudentValidation, registerStudent);
router.post('/company/register', authenticate, registerCompanyValidation, registerCompany);
router.post('/company/verify', authenticate, verifyCompanyValidation, verifyCompany);
router.get('/pending', authenticate, getPendingRegistrations);
router.get('/status', authenticate, getUserRegistrationStatus);

export default router; 