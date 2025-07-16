import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { isValidEmail } from '../utils/helpers';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email là bắt buộc';
        } else if (!isValidEmail(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu là bắt buộc';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center modern-gradient p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            {/* Enhanced floating elements with more variety */}
            <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-400/5 rounded-full blur-3xl animate-pulse-glow"></div>

            {/* Additional floating elements for more dynamic effect */}
            <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-purple-400/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-28 h-28 bg-cyan-400/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-3/4 left-1/3 w-20 h-20 bg-pink-400/6 rounded-full blur-2xl animate-float" style={{ animationDelay: '4s' }}></div>

            {/* Moving particles */}
            <div className="absolute top-10 left-1/2 w-2 h-2 bg-blue-400/30 rounded-full animate-particles"></div>
            <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-indigo-400/40 rounded-full animate-particles" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/3 w-1 h-1 bg-purple-400/50 rounded-full animate-particles" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-20 right-1/2 w-1.5 h-1.5 bg-cyan-400/35 rounded-full animate-particles" style={{ animationDelay: '3s' }}></div>

            {/* Gradient orbs */}
            <div className="absolute top-1/3 right-10 w-16 h-16 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-orb-float"></div>
            <div className="absolute bottom-1/3 left-10 w-20 h-20 bg-gradient-to-r from-indigo-400/15 to-cyan-400/15 rounded-full blur-xl animate-orb-float" style={{ animationDelay: '2.5s' }}></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <img
                        src="/logo.svg"
                        alt="VieVerse"
                        className="h-16 w-16 mx-auto mb-1"
                    />
                    <h1 className="text-3xl font-bold text-gradient">VieVerse</h1>
                    <p className="text-gray-600 mt-2">Kết nối sinh viên và doanh nghiệp</p>
                </div>

                <Card className="animate-slide-up shadow-2xl border-0 bg-white/90 backdrop-blur-xl">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-bold text-center text-gray-900">
                            Đăng nhập
                        </CardTitle>
                        <p className="text-center text-gray-600">
                            Chào mừng bạn quay trở lại! 👋
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    icon={Mail}
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>

                            {/* Password field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Mật khẩu <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        icon={Lock}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        error={errors.password}
                                        className="pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password}</p>
                                )}
                            </div>

                            {/* Forgot password link */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            {/* Submit button */}
                            <Button
                                type="submit"
                                variant="gradient"
                                className="w-full h-12"
                                loading={loading}
                                disabled={loading}
                            >
                                Đăng nhập
                            </Button>
                        </form>

                        {/* Register link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© 2025 VieVerse. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;