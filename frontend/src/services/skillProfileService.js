import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/skill-profiles';

// Configure axios defaults
const skillProfileAPI = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include token
skillProfileAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
skillProfileAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Get my skill profile
export const getMySkillProfile = async () => {
    try {
        const response = await skillProfileAPI.get('/my-profile');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Lỗi khi lấy hồ sơ kỹ năng' };
    }
};

// Get skill profile by user ID
export const getSkillProfileById = async (userId) => {
    try {
        const response = await skillProfileAPI.get(`/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Lỗi khi lấy hồ sơ kỹ năng' };
    }
};

// Create or update skill profile
export const createOrUpdateSkillProfile = async (profileData) => {
    try {
        const response = await skillProfileAPI.post('/', profileData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Lỗi khi tạo/cập nhật hồ sơ kỹ năng' };
    }
};

// Delete skill profile
export const deleteSkillProfile = async () => {
    try {
        const response = await skillProfileAPI.delete('/');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Lỗi khi xóa hồ sơ kỹ năng' };
    }
};

// Search skill profiles
export const searchSkillProfiles = async (params = {}) => {
    try {
        const response = await skillProfileAPI.get('/', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Lỗi khi tìm kiếm hồ sơ kỹ năng' };
    }
};

// Helper functions for skill profile data
export const formatSkillLevel = (level) => {
    const levelMap = {
        'basic': 'Cơ bản',
        'intermediate': 'Trung bình',
        'advanced': 'Thành thạo'
    };
    return levelMap[level] || level;
};

export const getSkillLevelColor = (level) => {
    const colorMap = {
        'basic': 'bg-blue-100 text-blue-800',
        'intermediate': 'bg-yellow-100 text-yellow-800',
        'advanced': 'bg-green-100 text-green-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
};

export const validateSkillData = (skill) => {
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
        errors.push('Mức độ phải là Cơ bản, Trung bình hoặc Thành thạo');
    }

    return errors;
};

export const validateLearningGoal = (goal) => {
    const errors = [];

    if (!goal.skill || goal.skill.trim().length < 2) {
        errors.push('Tên kỹ năng muốn học phải có ít nhất 2 ký tự');
    }

    if (!goal.reason || goal.reason.trim().length < 10) {
        errors.push('Lý do học tập phải có ít nhất 10 ký tự');
    }

    if (!goal.target_date) {
        errors.push('Mục tiêu thời gian là bắt buộc');
    } else if (new Date(goal.target_date) <= new Date()) {
        errors.push('Mục tiêu thời gian phải trong tương lai');
    }

    return errors;
};

export const validateInterestedField = (field) => {
    const errors = [];

    if (!field.name || field.name.trim().length < 2) {
        errors.push('Tên lĩnh vực phải có ít nhất 2 ký tự');
    }

    if (!field.reason || field.reason.trim().length < 10) {
        errors.push('Lý do quan tâm phải có ít nhất 10 ký tự');
    }

    return errors;
};

export default skillProfileAPI; 