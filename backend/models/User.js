import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 100]
        }
    },
    role: {
        type: DataTypes.ENUM('student', 'company', 'admin'),
        allowNull: false,
        defaultValue: 'student'
    },
    // Common fields
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    },
    // Student specific fields
    university: {
        type: DataTypes.STRING,
        allowNull: true
    },
    major: {
        type: DataTypes.STRING,
        allowNull: true
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
        defaultValue: []
    },
    tokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    // Company specific fields
    company_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    industry: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    website: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Blockchain fields
    wallet_address: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            is: /^0x[a-fA-F0-9]{40}$/ // Ethereum address format
        }
    },
    blockchain_registered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Hash password before saving
User.beforeCreate(async (user) => {
    if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

// Instance method to check password
User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Instance method to get public profile
User.prototype.getPublicProfile = function () {
    const profile = this.toJSON();
    delete profile.password;
    return profile;
};

export default User; 