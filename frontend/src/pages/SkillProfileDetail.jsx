import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    ArrowLeft,
    Star,
    Target,
    Briefcase,
    User,
    Calendar,
    GraduationCap,
    BookOpen,
    MapPin,
    Eye,
    Mail,
    Phone,
    Globe,
    CheckCircle,
    Clock,
    Award,
    Plus
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getSkillProfileById, formatSkillLevel, getSkillLevelColor } from '../services/skillProfileService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const SkillProfileDetail = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [skillProfile, setSkillProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSkillProfile();
    }, [userId]);

    const loadSkillProfile = async () => {
        try {
            setLoading(true);
            const response = await getSkillProfileById(userId);
            setSkillProfile(response.skillProfile);
        } catch (error) {
            toast.error(error.error || 'Lỗi khi tải hồ sơ kỹ năng');
            navigate('/skill-profile-search');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="xl" text="Đang tải hồ sơ kỹ năng..." fullScreen />;
    }

    if (!skillProfile) {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Eye className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Không tìm thấy hồ sơ
                </h2>
                <p className="text-gray-600 mb-6">
                    Hồ sơ kỹ năng không tồn tại hoặc không công khai.
                </p>
                <Button
                    onClick={() => navigate('/skill-profile-search')}
                    variant="outline"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại tìm kiếm
                </Button>
            </div>
        );
    }

    const profileUser = skillProfile.user;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    onClick={() => navigate('/skill-profile-search')}
                    variant="outline"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại
                </Button>

                <Badge variant="success" className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    Hồ sơ công khai
                </Badge>
            </div>

            {/* Profile Header */}
            <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        <div className="relative">
                            <img
                                className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.name)}&size=96&background=3B82F6&color=fff&bold=true`}
                                alt={profileUser.name}
                            />
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2">
                                <User className="h-4 w-4 text-white" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {profileUser.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                                <div className="flex items-center">
                                    <GraduationCap className="w-4 h-4 mr-2" />
                                    {profileUser.university}
                                </div>
                                <div className="flex items-center">
                                    <BookOpen className="w-4 h-4 mr-2" />
                                    {profileUser.major}
                                </div>
                            </div>

                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                Cập nhật lần cuối: {format(new Date(skillProfile.last_updated), 'dd/MM/yyyy HH:mm', { locale: vi })}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Skills */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                Kỹ năng hiện có ({skillProfile.current_skills?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {skillProfile.current_skills && skillProfile.current_skills.length > 0 ? (
                                <div className="space-y-4">
                                    {skillProfile.current_skills.map((skill, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                                                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                                        <span>Nguồn: {skill.source}</span>
                                                        <Badge className={getSkillLevelColor(skill.level)}>
                                                            {formatSkillLevel(skill.level)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Chưa có kỹ năng nào được thêm</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Learning Goals */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-green-500" />
                                Mục tiêu học tập ({skillProfile.learning_goals?.length || 0})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {skillProfile.learning_goals && skillProfile.learning_goals.length > 0 ? (
                                <div className="space-y-4">
                                    {skillProfile.learning_goals.map((goal, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <h4 className="font-semibold text-gray-900 mb-2">{goal.skill}</h4>
                                            <p className="text-sm text-gray-600 mb-2">{goal.reason}</p>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                Mục tiêu: {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: vi })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Chưa có mục tiêu nào</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Interested Fields */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                        Lĩnh vực quan tâm ({skillProfile.interested_fields?.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {skillProfile.interested_fields && skillProfile.interested_fields.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {skillProfile.interested_fields.map((field, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <h4 className="font-semibold text-gray-900 mb-2">{field.name}</h4>
                                    <p className="text-sm text-gray-600">{field.reason}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>Chưa có lĩnh vực nào được thêm</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            {skillProfile.summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-500" />
                            Tóm tắt về bản thân
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {skillProfile.summary}
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Contact Information */}
            {user?.role === 'company' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Mail className="w-5 h-5 mr-2 text-blue-500" />
                            Thông tin liên hệ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">{profileUser.email}</p>
                                </div>
                            </div>

                            {profileUser.phone && (
                                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Số điện thoại</p>
                                        <p className="text-sm text-gray-600">{profileUser.phone}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start space-x-3">
                                <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-1">
                                        Tại sao nên chọn sinh viên này?
                                    </h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Có {skillProfile.current_skills?.length || 0} kỹ năng được xác nhận</li>
                                        <li>• Có {skillProfile.learning_goals?.length || 0} mục tiêu học tập rõ ràng</li>
                                        <li>• Quan tâm đến {skillProfile.interested_fields?.length || 0} lĩnh vực</li>
                                        <li>• Hồ sơ được cập nhật thường xuyên</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            {user?.role === 'company' && (
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={() => navigate(`/tasks?student=${userId}`)}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                <Briefcase className="w-4 h-4 mr-2" />
                                Xem nhiệm vụ phù hợp
                            </Button>

                            <Button
                                onClick={() => navigate(`/tasks/create?student=${userId}`)}
                                variant="outline"
                                className="flex-1"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo nhiệm vụ mới
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default SkillProfileDetail; 