import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const SkillProfile = sequelize.define('SkillProfile', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    // Kỹ năng hiện có
    current_skills: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of current skills with details'
    },
    // Mục tiêu học tập
    learning_goals: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of learning goals'
    },
    // Lĩnh vực quan tâm
    interested_fields: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of interested fields/careers'
    },
    // Thông tin bổ sung
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Tóm tắt về bản thân và định hướng'
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Cho phép công ty xem hồ sơ'
    },
    last_updated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default SkillProfile; 