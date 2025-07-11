import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Building,
    GraduationCap,
    Globe,
    Phone
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { isValidEmail, isValidUrl, parseSkills } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: USER_ROLES.STUDENT,
        phone: '',
        // Student fields
        university: '',
        major: '',
        skills: '',
        // Company fields
        company_name: '',
        industry: '',
        description: '',
        website: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth();
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

        if (!formData.name.trim()) {
            newErrors.name = 'Tên là bắt buộc';
        }

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

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Xác nhận mật khẩu không khớp';
        }

        if (formData.role === USER_ROLES.STUDENT) {
            if (!formData.university.trim()) {
                newErrors.university = 'Trường đại học là bắt buộc';
            }
            if (!formData.major.trim()) {
                newErrors.major = 'Ngành học là bắt buộc';
            }
        } else if (formData.role === USER_ROLES.COMPANY) {
            if (!formData.company_name.trim()) {
                newErrors.company_name = 'Tên công ty là bắt buộc';
            }
            if (!formData.industry.trim()) {
                newErrors.industry = 'Ngành nghề là bắt buộc';
            }
            if (formData.website && !isValidUrl(formData.website)) {
                newErrors.website = 'Website không hợp lệ';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const registrationData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                phone: formData.phone
            };

            if (formData.role === USER_ROLES.STUDENT) {
                registrationData.university = formData.university;
                registrationData.major = formData.major;
                registrationData.skills = parseSkills(formData.skills);
            } else {
                registrationData.company_name = formData.company_name;
                registrationData.industry = formData.industry;
                registrationData.description = formData.description;
                registrationData.website = formData.website;
            }

            const result = await register(registrationData);
            if (result.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center modern-gradient p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 grid-pattern opacity-20" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in">
                    <img
                        src="/logo.svg"
                        alt="VieVerse"
                        className="h-16 w-16 mx-auto mb-1"
                    />
                    <h1 className="text-3xl font-bold text-gradient">VieVerse</h1>
                    <p className="text-gray-600 mt-2">Tham gia cộng đồng ngay hôm nay</p>
                </div>

                <Card className="animate-slide-up shadow-2xl border-0 bg-white/80 backdrop-blur-md">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl font-bold text-center text-gray-900">
                            Đăng ký tài khoản
                        </CardTitle>
                        <p className="text-center text-gray-600">
                            Tạo tài khoản để bắt đầu hành trình của bạn 🚀
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Role selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Loại tài khoản <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value={USER_ROLES.STUDENT}>🎓 Sinh viên</option>
                                    <option value={USER_ROLES.COMPANY}>🏢 Doanh nghiệp</option>
                                </Select>
                            </div>

                            {/* Basic info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700">
                                        Tên {formData.role === USER_ROLES.STUDENT ? 'sinh viên' : 'người đại diện'} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        icon={User}
                                        placeholder="Nhập tên của bạn"
                                        value={formData.name}
                                        onChange={handleChange}
                                        error={errors.name}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

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
                            </div>

                            {/* Password fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            icon={Lock}
                                            placeholder="••••••••"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            error={errors.confirmPassword}
                                            className="pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                    )}
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                                    Số điện thoại
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    icon={Phone}
                                    placeholder="0123456789"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>

                            {/* Role-specific fields */}
                            {formData.role === USER_ROLES.STUDENT ? (
                                <div className="space-y-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <h3 className="font-semibold text-purple-900 flex items-center">
                                        <GraduationCap className="h-5 w-5 mr-2" />
                                        Thông tin học tập
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="university" className="text-sm font-medium text-gray-700">
                                                Trường đại học <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="university"
                                                name="university"
                                                placeholder="Trường Đại học Công nghệ"
                                                value={formData.university}
                                                onChange={handleChange}
                                                error={errors.university}
                                            />
                                            {errors.university && (
                                                <p className="text-sm text-red-600">{errors.university}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="major" className="text-sm font-medium text-gray-700">
                                                Ngành học <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="major"
                                                name="major"
                                                placeholder="Khoa học máy tính"
                                                value={formData.major}
                                                onChange={handleChange}
                                                error={errors.major}
                                            />
                                            {errors.major && (
                                                <p className="text-sm text-red-600">{errors.major}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="skills" className="text-sm font-medium text-gray-700">
                                            Kỹ năng (phân cách bằng dấu phẩy)
                                        </label>
                                        <Input
                                            id="skills"
                                            name="skills"
                                            placeholder="JavaScript, React, Node.js, Python"
                                            value={formData.skills}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                                    <h3 className="font-semibold text-indigo-900 flex items-center">
                                        <Building className="h-5 w-5 mr-2" />
                                        Thông tin công ty
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                                                Tên công ty <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="company_name"
                                                name="company_name"
                                                placeholder="Công ty ABC"
                                                value={formData.company_name}
                                                onChange={handleChange}
                                                error={errors.company_name}
                                            />
                                            {errors.company_name && (
                                                <p className="text-sm text-red-600">{errors.company_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label htmlFor="industry" className="text-sm font-medium text-gray-700">
                                                Ngành nghề <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                id="industry"
                                                name="industry"
                                                placeholder="Công nghệ thông tin"
                                                value={formData.industry}
                                                onChange={handleChange}
                                                error={errors.industry}
                                            />
                                            {errors.industry && (
                                                <p className="text-sm text-red-600">{errors.industry}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="website" className="text-sm font-medium text-gray-700">
                                            Website
                                        </label>
                                        <Input
                                            id="website"
                                            name="website"
                                            icon={Globe}
                                            placeholder="https://example.com"
                                            value={formData.website}
                                            onChange={handleChange}
                                            error={errors.website}
                                        />
                                        {errors.website && (
                                            <p className="text-sm text-red-600">{errors.website}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                            Mô tả công ty
                                        </label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Mô tả về công ty của bạn..."
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Submit button */}
                            <Button
                                type="submit"
                                variant="gradient"
                                className="w-full h-12"
                                loading={loading}
                                disabled={loading}
                            >
                                Tạo tài khoản
                            </Button>
                        </form>

                        {/* Login link */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/login"
                                    className="font-medium text-purple-600 hover:text-purple-700"
                                >
                                    Đăng nhập ngay
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

export default Register;