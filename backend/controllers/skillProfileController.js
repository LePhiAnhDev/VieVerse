import { validationResult } from 'express-validator';
import { User, SkillProfile } from '../models/index.js';

// Validation helpers
const validateSkillData = (skill) => {
    const errors = [];
    if (!skill.name || skill.name.trim().length < 2) {
        errors.push('Tên kỹ năng phải có ít nhất 2 ký tự');
    }
    if (!skill.description || skill.description.trim().length < 10) {
        errors.push('Mô tả kỹ năng phải có ít nhất 10 ký tự');
    }
    if (!skill.source || skill.source.trim().length < 2) {
        errors.push('Nguồn học tập là bắt buộc');
    }
    if (!skill.level || !['basic', 'intermediate', 'advanced'].includes(skill.level)) {
        errors.push('Mức độ phải là basic, intermediate hoặc advanced');
    }
    return errors;
};

const validateLearningGoal = (goal) => {
    const errors = [];
    if (!goal.skill || goal.skill.trim().length < 2) {
        errors.push('Tên kỹ năng muốn học phải có ít nhất 2 ký tự');
    }
    if (!goal.reason || goal.reason.trim().length < 10) {
        errors.push('Lý do học tập phải có ít nhất 10 ký tự');
    }
    if (!goal.target_date) {
        errors.push('Mục tiêu thời gian là bắt buộc');
    }
    return errors;
};

const validateInterestedField = (field) => {
    const errors = [];
    if (!field.name || field.name.trim().length < 2) {
        errors.push('Tên lĩnh vực phải có ít nhất 2 ký tự');
    }
    if (!field.reason || field.reason.trim().length < 10) {
        errors.push('Lý do quan tâm phải có ít nhất 10 ký tự');
    }
    return errors;
};

// Get skill profile for current user
export const getMySkillProfile = async (req, res) => {
    try {
        const skillProfile = await SkillProfile.findOne({
            where: { user_id: req.user.id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'university', 'major']
            }]
        });

        if (!skillProfile) {
            return res.status(404).json({
                error: 'Hồ sơ kỹ năng chưa được tạo'
            });
        }

        res.json({
            skillProfile
        });
    } catch (error) {
        console.error('Get skill profile error:', error);
        res.status(500).json({
            error: 'Lỗi server khi lấy hồ sơ kỹ năng'
        });
    }
};

// Get skill profile by user ID (for companies)
export const getSkillProfileById = async (req, res) => {
    try {
        const { userId } = req.params;

        const skillProfile = await SkillProfile.findOne({
            where: {
                user_id: userId,
                is_public: true
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'university', 'major']
            }]
        });

        if (!skillProfile) {
            return res.status(404).json({
                error: 'Hồ sơ kỹ năng không tồn tại hoặc không công khai'
            });
        }

        res.json({
            skillProfile
        });
    } catch (error) {
        console.error('Get skill profile by ID error:', error);
        res.status(500).json({
            error: 'Lỗi server khi lấy hồ sơ kỹ năng'
        });
    }
};

// Create or update skill profile
export const createOrUpdateSkillProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dữ liệu không hợp lệ',
                details: errors.array()
            });
        }

        const { current_skills, learning_goals, interested_fields, summary, is_public } = req.body;

        // Validate current skills
        if (current_skills && Array.isArray(current_skills)) {
            for (let i = 0; i < current_skills.length; i++) {
                const skillErrors = validateSkillData(current_skills[i]);
                if (skillErrors.length > 0) {
                    return res.status(400).json({
                        error: `Lỗi ở kỹ năng thứ ${i + 1}`,
                        details: skillErrors
                    });
                }
            }
        }

        // Validate learning goals
        if (learning_goals && Array.isArray(learning_goals)) {
            for (let i = 0; i < learning_goals.length; i++) {
                const goalErrors = validateLearningGoal(learning_goals[i]);
                if (goalErrors.length > 0) {
                    return res.status(400).json({
                        error: `Lỗi ở mục tiêu thứ ${i + 1}`,
                        details: goalErrors
                    });
                }
            }
        }

        // Validate interested fields
        if (interested_fields && Array.isArray(interested_fields)) {
            for (let i = 0; i < interested_fields.length; i++) {
                const fieldErrors = validateInterestedField(interested_fields[i]);
                if (fieldErrors.length > 0) {
                    return res.status(400).json({
                        error: `Lỗi ở lĩnh vực thứ ${i + 1}`,
                        details: fieldErrors
                    });
                }
            }
        }

        // Check if user is a student
        const user = await User.findByPk(req.user.id);
        if (user.role !== 'student') {
            return res.status(403).json({
                error: 'Chỉ sinh viên mới có thể tạo hồ sơ kỹ năng'
            });
        }

        // Find existing profile or create new one
        let skillProfile = await SkillProfile.findOne({
            where: { user_id: req.user.id }
        });

        const profileData = {
            current_skills: current_skills || [],
            learning_goals: learning_goals || [],
            interested_fields: interested_fields || [],
            summary: summary || null,
            is_public: is_public !== undefined ? is_public : true,
            last_updated: new Date()
        };

        if (skillProfile) {
            // Update existing profile
            await skillProfile.update(profileData);
        } else {
            // Create new profile
            skillProfile = await SkillProfile.create({
                user_id: req.user.id,
                ...profileData
            });
        }

        // Get updated profile with user info
        const updatedProfile = await SkillProfile.findOne({
            where: { id: skillProfile.id },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'university', 'major']
            }]
        });

        res.json({
            message: skillProfile ? 'Cập nhật hồ sơ kỹ năng thành công' : 'Tạo hồ sơ kỹ năng thành công',
            skillProfile: updatedProfile
        });
    } catch (error) {
        console.error('Create/Update skill profile error:', error);
        res.status(500).json({
            error: 'Lỗi server khi tạo/cập nhật hồ sơ kỹ năng'
        });
    }
};

// Delete skill profile
export const deleteSkillProfile = async (req, res) => {
    try {
        const skillProfile = await SkillProfile.findOne({
            where: { user_id: req.user.id }
        });

        if (!skillProfile) {
            return res.status(404).json({
                error: 'Hồ sơ kỹ năng không tồn tại'
            });
        }

        await skillProfile.destroy();

        res.json({
            message: 'Xóa hồ sơ kỹ năng thành công'
        });
    } catch (error) {
        console.error('Delete skill profile error:', error);
        res.status(500).json({
            error: 'Lỗi server khi xóa hồ sơ kỹ năng'
        });
    }
};

// Search skill profiles (for companies)
export const searchSkillProfiles = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            skills,
            university,
            major,
            sort = 'last_updated',
            order = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {
            is_public: true
        };

        // Build include clause for user
        const includeClause = {
            model: User,
            as: 'user',
            where: { role: 'student' },
            attributes: ['id', 'name', 'university', 'major']
        };

        // Filter by skills
        if (skills) {
            const skillArray = skills.split(',').map(s => s.trim());
            whereClause.current_skills = {
                [require('sequelize').Op.overlap]: skillArray
            };
        }

        // Filter by university
        if (university) {
            includeClause.where.university = {
                [require('sequelize').Op.iLike]: `%${university}%`
            };
        }

        // Filter by major
        if (major) {
            includeClause.where.major = {
                [require('sequelize').Op.iLike]: `%${major}%`
            };
        }

        const { count, rows } = await SkillProfile.findAndCountAll({
            where: whereClause,
            include: [includeClause],
            order: [[sort, order]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            skillProfiles: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Search skill profiles error:', error);
        res.status(500).json({
            error: 'Lỗi server khi tìm kiếm hồ sơ kỹ năng'
        });
    }
}; 