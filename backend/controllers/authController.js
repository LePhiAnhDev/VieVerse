import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/index.js';
import { Op } from 'sequelize';
import { sendOTP, sendWelcomeEmail, sendVerificationLink } from '../utils/mailer.js';
import crypto from 'crypto';

// Rate limiting cho OTP requests
const otpRequestTracker = new Map();
const OTP_RATE_LIMIT = 3; // 3 requests per 15 minutes
const OTP_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
//.//
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// Helper function để check rate limiting
const checkOTPRateLimit = (email) => {
    const now = Date.now();
    const userRequests = otpRequestTracker.get(email) || [];
    
    // Lọc bỏ các request cũ hơn 15 phút
    const recentRequests = userRequests.filter(time => now - time < OTP_RATE_WINDOW);
    
    if (recentRequests.length >= OTP_RATE_LIMIT) {
        return false;
    }
    
    // Thêm request mới
    recentRequests.push(now);
    otpRequestTracker.set(email, recentRequests);
    
    return true;
};
//.//

export const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, name, role, wallet_address, ...additionalData } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists with this email'
            });
        }

        // Check if wallet address is already registered (only if provided)
        if (wallet_address) {
            const existingWalletUser = await User.findOne({ where: { wallet_address } });
            if (existingWalletUser) {
                return res.status(409).json({
                    error: 'Wallet address is already registered'
                });
            }
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        // Create user data based on role
        let userData = {
            email,
            password,
            name,
            role: role || 'student',
            wallet_address: wallet_address || null,
            blockchain_registered: false, // Will be updated when wallet is connected
            email_verified: false,
            verification_token: verificationToken
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
        try {
            await sendVerificationLink(email, verificationToken, name);
            console.log('Email sent successfully');
            return res.status(201).json({
                success: true,
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh.',
                data: {
                    userId: user.id,
                    email: user.email
                }
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message, emailError.stack);
            await user.destroy();
            return res.status(500).json({
                error: 'Không thể gửi email xác minh.', details: emailError.message,
                details: emailError.message
            });
        }
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
};

//Hàm verify email link
export const verifyEmailLink = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ error: 'Token xác minh là bắt buộc' });
        }

        const user = await User.findOne({ where: { verification_token: token } });
        if (!user) {
            return res.status(400).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
        }

        if (user.email_verified) {
            return res.status(400).json({ error: 'Email đã được xác minh trước đó' });
        }

        await user.update({
            verification_token: null,
            email_verified: true,
            verified_at: new Date()
        });

        const tokenJwt = generateToken(user.id);
        sendWelcomeEmail(user.email, user.name, user.role).catch(error => {
            console.error('Failed to send welcome email:', error);
        });

        return res.json({
            success: true,
            message: 'Xác minh email thành công!',
            token: tokenJwt,
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Lỗi server trong quá trình xác minh email' });
    }
};
//.//

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
        //Kiểm tra và gửi OTP nếu email chưa xác minh
        if (!user.email_verified) {
            if (!checkOTPRateLimit(email)) {
            return res.status(403).json({
                error: 'Tài khoản chưa xác minh email. Vui lòng kiểm tra email để nhận mã OTP.',
                needEmailVerification: true,
                email: user.email
                });
            }
        //check otp ratelimiting
        if (!checkOTPRateLimit(email)){
            return res.status(429).json({
                error: 'Vui lòng thử lại sau 15 phút.',
                retryAfter: 15 * 60
            });
        }
        //Generate and send OTP
        const otp = generateOTP();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        await user.update({
            otp_hash: otpHash,
            otp_expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        try {
            await sendOTP(email, otp, user.name);
            return res.json({
                success: true,
                message: 'OTP đã được gửi tới email của bạn.',
                data: { email, otpExpiresAt: user.otp_expires }
            });
        } catch (emailError) {
            return res.status(500).json({
                error: 'Không thể gửi OTP. Vui lòng thử lại.',
                details: emailError.message
            });
        }
    }
    //Nếu email đã xác minh, tiếp tục luồng đăng nhập 
    if (!checkOTPRateLimit(email)) {
            return res.status(429).json({
                error: 'Vui lòng thử lại sau 15 phút.',
                retryAfter: 15 * 60
            });
        }
        const otp = generateOTP();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        await user.update({
            otp_hash: otpHash,
            otp_expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });
        try {
            await sendOTP(email, otp, user.name);
            return res.json({
                success: true,
                message: 'OTP đã được gửi tới email của bạn.',
                data: { email, otpExpiresAt: user.otp_expires }
            });
        } catch (emailError) {
            return res.status(500).json({
                error: 'Không thể gửi OTP. Vui lòng thử lại.',
                details: emailError.message
            });
        }
    }
        catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
};

//Function Verify login
export const verifyloginOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ 
                error: 'Email và mã OTP là bắt buộc' 
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ 
                error: 'Không tìm thấy người dùng' 
            });
        }
        // // Check if already verified
        // if (user.email_verified) {
        //     return res.status(400).json({ 
        //         error: 'Email đã được xác minh trước đó' 
        //     });
        // }
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');
        const now = Date.now(); 
        // Check OTP validity
        if (!user.otp_hash || user.otp_hash !== otpHash) {
            return res.status(400).json({ 
                error: 'Mã OTP không chính xác' 
            });
        }

        if (now > user.otp_expires) {
            return res.status(400).json({ 
                error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' 
            });
        }

        // Verify user
        await user.update({
            otp_hash: null,
            otp_expires: null,
            email_verified: true,
            verified_at: new Date()
        });

        // Generate token for immediate login
        const token = generateToken(user.id);

        // Send welcome email (không chặn response)
        sendWelcomeEmail(user.email, user.name, user.role).catch(error => {
            console.error('Failed to send welcome email:', error);
        });

        return res.json({
            success: true,
            message: 'Xác minh email thành công! Chào mừng bạn đến với VieVerse.',
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            error: 'Lỗi server trong quá trình xác minh OTP'
        });
    }
};
export const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                error: 'Email là bắt buộc' 
            });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ 
                error: 'Không tìm thấy người dùng' 
            });
        }

        // Check if already verified
        if (user.email_verified) {
            return res.status(400).json({ 
                error: 'Email đã được xác minh' 
            });
        }

        // Check rate limiting
        if (!checkOTPRateLimit(email)) {
            return res.status(429).json({
                error: 'Vui lòng thử lại sau 15 phút.',
                retryAfter: 15 * 60
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        // Update user with new OTP
        await user.update({
            otp_hash: otpHash,
            otp_expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        // Send OTP
        try {
            await sendOTP(email, otp, user.name);
            
            return res.json({
                success: true,
                message: 'Mã OTP đã được gửi tới email của bạn.',
                data: {
                    email,
                    otpExpiresAt: user.otp_expires
                }
            });
        } catch (emailError) {
            return res.status(500).json({
                error: 'Không thể gửi email. Vui lòng thử lại.',
                details: emailError.message
            });
        }

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            error: 'Lỗi server trong quá trình gửi lại OTP'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password', 'otp_hash'] }
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        res.json({
            success: true,
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
        delete updateData.otp_hash;
        delete updateData.otp_expires;

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        await user.update(updateData);

        res.json({
            success: true,
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
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

export const connectWallet = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { wallet_address } = req.body;

        // Check if wallet address is already registered by another user
        const existingWalletUser = await User.findOne({
            where: {
                wallet_address,
                id: { [Op.ne]: req.user.id } // Exclude current user
            }
        });

        if (existingWalletUser) {
            return res.status(409).json({
                error: 'Wallet address is already registered by another user'
            });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            });
        }

        // Update user's wallet address and blockchain registration status
        await user.update({
            wallet_address,
            blockchain_registered: true
        });

        res.json({
            message: 'Wallet connected successfully',
            user: user.getPublicProfile()
        });
    } catch (error) {
        console.error('Connect wallet error:', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
}; 