import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const BlockchainRegistration = sequelize.define('BlockchainRegistration', {
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
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^0x[a-fA-F0-9]{40}$/ // Ethereum address format
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'company'),
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
    },
    approved_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'User',
            key: 'id'
        }
    },
    approved_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    blockchain_tx_hash: {
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'blockchain_registrations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

export default BlockchainRegistration; 