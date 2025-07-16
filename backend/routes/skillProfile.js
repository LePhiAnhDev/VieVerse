import express from 'express';
import { body, param, query } from 'express-validator';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
    getMySkillProfile,
    getSkillProfileById,
    createOrUpdateSkillProfile,
    deleteSkillProfile,
    searchSkillProfiles
} from '../controllers/skillProfileController.js';

const router = express.Router();

// Validation rules
const skillValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên kỹ năng phải từ 2-100 ký tự'),
    body('description')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Mô tả kỹ năng phải từ 10-500 ký tự'),
    body('source')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nguồn học tập phải từ 2-100 ký tự'),
    body('level')
        .isIn(['basic', 'intermediate', 'advanced'])
        .withMessage('Mức độ phải là basic, intermediate hoặc advanced')
];

const learningGoalValidation = [
    body('skill')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên kỹ năng muốn học phải từ 2-100 ký tự'),
    body('reason')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Lý do học tập phải từ 10-500 ký tự'),
    body('target_date')
        .isISO8601()
        .withMessage('Mục tiêu thời gian phải là ngày hợp lệ')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Mục tiêu thời gian phải trong tương lai');
            }
            return true;
        })
];

const interestedFieldValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên lĩnh vực phải từ 2-100 ký tự'),
    body('reason')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Lý do quan tâm phải từ 10-500 ký tự')
];

const createUpdateValidation = [
    body('current_skills')
        .optional()
        .isArray()
        .withMessage('Kỹ năng hiện có phải là mảng'),
    body('current_skills.*.name')
        .if(body('current_skills').exists())
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên kỹ năng phải từ 2-100 ký tự'),
    body('current_skills.*.description')
        .if(body('current_skills').exists())
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Mô tả kỹ năng phải từ 10-500 ký tự'),
    body('current_skills.*.source')
        .if(body('current_skills').exists())
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nguồn học tập phải từ 2-100 ký tự'),
    body('current_skills.*.level')
        .if(body('current_skills').exists())
        .isIn(['basic', 'intermediate', 'advanced'])
        .withMessage('Mức độ phải là basic, intermediate hoặc advanced'),

    body('learning_goals')
        .optional()
        .isArray()
        .withMessage('Mục tiêu học tập phải là mảng'),
    body('learning_goals.*.skill')
        .if(body('learning_goals').exists())
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên kỹ năng muốn học phải từ 2-100 ký tự'),
    body('learning_goals.*.reason')
        .if(body('learning_goals').exists())
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Lý do học tập phải từ 10-500 ký tự'),
    body('learning_goals.*.target_date')
        .if(body('learning_goals').exists())
        .isISO8601()
        .withMessage('Mục tiêu thời gian phải là ngày hợp lệ')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('Mục tiêu thời gian phải trong tương lai');
            }
            return true;
        }),

    body('interested_fields')
        .optional()
        .isArray()
        .withMessage('Lĩnh vực quan tâm phải là mảng'),
    body('interested_fields.*.name')
        .if(body('interested_fields').exists())
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Tên lĩnh vực phải từ 2-100 ký tự'),
    body('interested_fields.*.reason')
        .if(body('interested_fields').exists())
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Lý do quan tâm phải từ 10-500 ký tự'),

    body('summary')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Tóm tắt không được quá 1000 ký tự'),

    body('is_public')
        .optional()
        .isBoolean()
        .withMessage('Trạng thái công khai phải là boolean')
];

const searchValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Trang phải là số nguyên dương'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Giới hạn phải từ 1-50'),
    query('skills')
        .optional()
        .isString()
        .withMessage('Kỹ năng phải là chuỗi'),
    query('university')
        .optional()
        .isString()
        .withMessage('Trường đại học phải là chuỗi'),
    query('major')
        .optional()
        .isString()
        .withMessage('Ngành học phải là chuỗi'),
    query('sort')
        .optional()
        .isIn(['last_updated', 'created_at'])
        .withMessage('Sắp xếp phải là last_updated hoặc created_at'),
    query('order')
        .optional()
        .isIn(['ASC', 'DESC'])
        .withMessage('Thứ tự phải là ASC hoặc DESC')
];

const userIdValidation = [
    param('userId')
        .isUUID()
        .withMessage('ID người dùng không hợp lệ')
];

// Routes
// Lấy hồ sơ kỹ năng của bản thân (sinh viên)
router.get('/my-profile', authenticate, authorize('student'), getMySkillProfile);

// Lấy hồ sơ kỹ năng theo ID (cho công ty)
router.get('/:userId', optionalAuth, userIdValidation, getSkillProfileById);

// Tạo hoặc cập nhật hồ sơ kỹ năng (sinh viên)
router.post('/', authenticate, authorize('student'), createUpdateValidation, createOrUpdateSkillProfile);
router.put('/', authenticate, authorize('student'), createUpdateValidation, createOrUpdateSkillProfile);

// Xóa hồ sơ kỹ năng (sinh viên)
router.delete('/', authenticate, authorize('student'), deleteSkillProfile);

// Tìm kiếm hồ sơ kỹ năng (cho công ty)
router.get('/', optionalAuth, searchValidation, searchSkillProfiles);

export default router; 