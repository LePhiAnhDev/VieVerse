import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, name, role, ...additionalData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists with this email'
            });
        }

        // Create user data based on role
        let userData = {
            email,
            password,
            name,
            role: role || 'student'
        };

        if (role === 'student') {
            userData = {
                ...userData,
                university: additionalData.university,
                major: additionalData.major,
                skills: additionalData.skills || [],
                phone: additionalData.phone
            };
        } else if (role === 'company') {
            userData = {
                ...userData,
                company_name: additionalData.company_name,
                industry: additionalData.industry,
                description: additionalData.description,
                website: additionalData.website,
                phone: additionalData.phone
            };
        }

        const user = await User.create(userData);
        const token = generateToken(user.id);

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        // Update last login
        await user.update({ last_login: new Date() });

        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { password, email, role, ...updateData } = req.body;

        // Don't allow updating sensitive fields
        delete updateData.id;
        delete updateData.tokens;
        delete updateData.created_at;
        delete updateData.updated_at;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        await user.update(updateData);

        res.json({
            message: 'Profile updated successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const changePassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { current_password, new_password } = req.body;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Verify current password
        const isValidPassword = await user.comparePassword(current_password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Update password
        await user.update({ password: new_password });

        res.json({
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}; 