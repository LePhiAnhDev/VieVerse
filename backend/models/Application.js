import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Application = sequelize.define('Application', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    task_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Task',
            key: 'id'
        }
    },
    student_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    cover_letter: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
        allowNull: false,
        defaultValue: 'pending'
    },
    applied_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    work_status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'submitted', 'completed'),
        allowNull: false,
        defaultValue: 'not_started'
    },
    submission_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    submission_files: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 5
        }
    },
    feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    }
});

export default Application; 