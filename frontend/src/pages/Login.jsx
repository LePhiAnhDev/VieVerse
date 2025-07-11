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
        <div className="min-h-screen flex items-center justify-center modern-gradient p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <img
                        src="/logo.svg"
                        alt="VieVerse"
                        className="h-16 w-16 mx-auto mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gradient">VieVerse</h1>
                    <p className="text-gray-600 mt-2">Kết nối sinh viên và doanh nghiệp</p>
                </div>

                <Card className="animate-slide-up shadow-2xl border-0 bg-white/80 backdrop-blur-md">
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
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
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

                        {/* Demo account info */}
                        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <p className="text-sm font-medium text-purple-900 mb-2">🚀 Tài khoản demo:</p>
                            <div className="space-y-1 text-xs text-purple-700">
                                <p><strong>Sinh viên:</strong> student1@example.com / password123</p>
                                <p><strong>Doanh nghiệp:</strong> company1@example.com / password123</p>
                            </div>
                        </div>

                        {/* Register link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/register"
                                    className="font-medium text-purple-600 hover:text-purple-700"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>© 2024 VieVerse. Tất cả quyền được bảo lưu.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;