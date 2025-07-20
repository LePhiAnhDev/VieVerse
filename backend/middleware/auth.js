import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid token. User not found.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token.'
            });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired.'
            });
        }

        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal server error during authentication.'
        });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.id);
        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        // If token is invalid, continue without authentication
        next();
    }
}; 
//Require Email
export const requireEmailVerification = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required.' });
        }
        if (!req.user.email_verified) {
            return res.status(403).json({
                error: 'Tài khoản chưa xác minh email. Vui lòng kiểm tra email để nhận link xác minh.',
                needEmailVerification: true,
                email: req.user.email
            });
        }
        next();
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
};