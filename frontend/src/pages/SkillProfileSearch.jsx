import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Search,
    Filter,
    MapPin,
    GraduationCap,
    Star,
    Eye,
    Calendar,
    Briefcase,
    BookOpen,
    Users,
    Target
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { searchSkillProfiles, formatSkillLevel, getSkillLevelColor } from '../services/skillProfileService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

const SkillProfileSearch = () => {
    const { user } = useAuth();
    const [skillProfiles, setSkillProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Filter states
    const [filters, setFilters] = useState({
        skills: '',
        university: '',
        major: '',
        sort: 'last_updated',
        order: 'DESC'
    });

    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        loadSkillProfiles();
    }, [pagination.page, filters]);

    const loadSkillProfiles = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            };

            const response = await searchSkillProfiles(params);
            setSkillProfiles(response.skillProfiles);
            setPagination(response.pagination);
        } catch (error) {
            toast.error(error.error || 'Lỗi khi tải danh sách hồ sơ kỹ năng');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const clearFilters = () => {
        setFilters({
            skills: '',
            university: '',
            major: '',
            sort: 'last_updated',
            order: 'DESC'
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const getSkillCount = (skills) => {
        return skills ? skills.length : 0;
    };

    const getGoalCount = (goals) => {
        return goals ? goals.length : 0;
    };

    const getFieldCount = (fields) => {
        return fields ? fields.length : 0;
    };

    if (user?.role !== 'company') {
        return (
            <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <Eye className="w-12 h-12 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Không có quyền truy cập
                </h2>
                <p className="text-gray-600">
                    Chỉ công ty mới có thể xem trang tìm kiếm hồ sơ kỹ năng.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <Card className="overflow-hidden bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="h-16 w-16 bg-green-600 rounded-full flex items-center justify-center">
                                    <Users className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Tìm kiếm hồ sơ kỹ năng
                                </h1>
                                <p className="text-lg text-gray-600 mt-1">
                                    Khám phá tài năng sinh viên phù hợp với dự án của bạn
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="outline"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            {showFilters && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2 text-blue-500" />
                            Bộ lọc tìm kiếm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kỹ năng
                                </label>
                                <Input
                                    placeholder="JavaScript, React, Python..."
                                    value={filters.skills}
                                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Trường đại học
                                </label>
                                <Input
                                    placeholder="Tên trường..."
                                    value={filters.university}
                                    onChange={(e) => handleFilterChange('university', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ngành học
                                </label>
                                <Input
                                    placeholder="Công nghệ thông tin..."
                                    value={filters.major}
                                    onChange={(e) => handleFilterChange('major', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sắp xếp theo
                                </label>
                                <Select
                                    value={filters.sort}
                                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                                >
                                    <option value="last_updated">Cập nhật gần nhất</option>
                                    <option value="created_at">Tạo mới nhất</option>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                            >
                                Xóa bộ lọc
                            </Button>

                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">Thứ tự:</span>
                                <Button
                                    size="sm"
                                    variant={filters.order === 'DESC' ? 'default' : 'outline'}
                                    onClick={() => handleFilterChange('order', 'DESC')}
                                >
                                    Mới nhất
                                </Button>
                                <Button
                                    size="sm"
                                    variant={filters.order === 'ASC' ? 'default' : 'outline'}
                                    onClick={() => handleFilterChange('order', 'ASC')}
                                >
                                    Cũ nhất
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Kết quả tìm kiếm ({pagination.total} hồ sơ)
                    </h2>

                    {loading && <LoadingSpinner size="sm" />}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, index) => (
                            <Card key={index} className="animate-pulse">
                                <CardContent className="p-6">
                                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-2 bg-gray-200 rounded mb-2"></div>
                                    <div className="h-2 bg-gray-200 rounded"></div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : skillProfiles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {skillProfiles.map((profile) => (
                                <Card key={profile.id} className="hover:shadow-lg transition-shadow duration-300">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                                                    {profile.user.name}
                                                </CardTitle>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center">
                                                        <GraduationCap className="w-4 h-4 mr-1" />
                                                        {profile.user.university}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <BookOpen className="w-4 h-4 mr-1" />
                                                        {profile.user.major}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="success" className="flex items-center">
                                                <Eye className="w-3 h-3 mr-1" />
                                                Công khai
                                            </Badge>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Skills */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                                Kỹ năng ({getSkillCount(profile.current_skills)})
                                            </h4>
                                            {profile.current_skills && profile.current_skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {profile.current_skills.slice(0, 3).map((skill, index) => (
                                                        <Badge
                                                            key={index}
                                                            className={`text-xs ${getSkillLevelColor(skill.level)}`}
                                                        >
                                                            {skill.name}
                                                        </Badge>
                                                    ))}
                                                    {profile.current_skills.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{profile.current_skills.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Chưa có kỹ năng</p>
                                            )}
                                        </div>

                                        {/* Learning Goals */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <Target className="w-4 h-4 mr-2 text-green-500" />
                                                Mục tiêu ({getGoalCount(profile.learning_goals)})
                                            </h4>
                                            {profile.learning_goals && profile.learning_goals.length > 0 ? (
                                                <div className="space-y-1">
                                                    {profile.learning_goals.slice(0, 2).map((goal, index) => (
                                                        <div key={index} className="text-sm text-gray-600">
                                                            • {goal.skill}
                                                        </div>
                                                    ))}
                                                    {profile.learning_goals.length > 2 && (
                                                        <div className="text-sm text-gray-500">
                                                            +{profile.learning_goals.length - 2} mục tiêu khác
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Chưa có mục tiêu</p>
                                            )}
                                        </div>

                                        {/* Interested Fields */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                                                Lĩnh vực ({getFieldCount(profile.interested_fields)})
                                            </h4>
                                            {profile.interested_fields && profile.interested_fields.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {profile.interested_fields.slice(0, 2).map((field, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {field.name}
                                                        </Badge>
                                                    ))}
                                                    {profile.interested_fields.length > 2 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{profile.interested_fields.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Chưa có lĩnh vực</p>
                                            )}
                                        </div>

                                        {/* Summary */}
                                        {profile.summary && (
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2">Tóm tắt</h4>
                                                <p className="text-sm text-gray-600 line-clamp-3">
                                                    {profile.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Cập nhật: {format(new Date(profile.last_updated), 'dd/MM/yyyy', { locale: vi })}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(`/skill-profile/${profile.user.id}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12">
                            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Search className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Không tìm thấy hồ sơ kỹ năng
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Thử thay đổi bộ lọc tìm kiếm hoặc tìm kiếm với từ khóa khác.
                            </p>
                            <Button
                                onClick={clearFilters}
                                variant="outline"
                            >
                                Xóa bộ lọc
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SkillProfileSearch; 