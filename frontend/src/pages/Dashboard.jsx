import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Briefcase,
    Users,
    CheckCircle,
    Coins,
    TrendingUp,
    Calendar,
    Plus,
    ArrowRight,
    Star,
    Clock
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import StatsCard from '../components/features/StatsCard';
import TaskCard from '../components/features/TaskCard';
import { getGreeting } from '../utils/helpers';
import { formatDate } from '../utils/formatters';

const Dashboard = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/users/dashboard');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner size="lg" text="Đang tải dashboard..." fullScreen />;
    }

    const stats = dashboardData?.dashboard?.stats || {};

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 p-8 text-white">
                <div className="absolute inset-0 grid-pattern opacity-10" />
                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold">
                                {getGreeting()}, {user?.name}! 👋
                            </h1>
                            <p className="text-indigo-100 text-lg">
                                {user?.role === 'student'
                                    ? 'Sẵn sàng khám phá những cơ hội mới hôm nay?'
                                    : 'Hãy quản lý dự án và kết nối với những tài năng trẻ!'}
                            </p>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            {user?.role === 'student' && (
                                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                                    <Coins className="h-5 w-5 text-yellow-300" />
                                    <span className="font-semibold text-lg">{user?.tokens || 0}</span>
                                    <span className="text-indigo-100">Token</span>
                                </div>
                            )}

                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&size=64&background=ffffff&color=7c3aed&format=svg`}
                                alt={user?.name}
                                className="h-16 w-16 rounded-full border-4 border-white/20"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user?.role === 'student' ? (
                    <>
                        <StatsCard
                            title="Tổng ứng tuyển"
                            value={stats.total_applications || 0}
                            icon={Briefcase}
                            gradient
                            trend={12}
                        />
                        <StatsCard
                            title="Được chấp nhận"
                            value={stats.accepted_applications || 0}
                            icon={CheckCircle}
                            changeType="positive"
                            change="+3 tuần này"
                        />
                        <StatsCard
                            title="Hoàn thành"
                            value={stats.completed_tasks || 0}
                            icon={TrendingUp}
                            trend={8}
                        />
                        <StatsCard
                            title="Token tích lũy"
                            value={stats.current_tokens || 0}
                            icon={Coins}
                            description="Tổng token đã kiếm được"
                        />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="Tổng nhiệm vụ"
                            value={stats.total_tasks || 0}
                            icon={Briefcase}
                            gradient
                            trend={15}
                        />
                        <StatsCard
                            title="Đang hoạt động"
                            value={stats.active_tasks || 0}
                            icon={Calendar}
                            changeType="positive"
                            change="+2 tuần này"
                        />
                        <StatsCard
                            title="Đã hoàn thành"
                            value={stats.completed_tasks || 0}
                            icon={CheckCircle}
                            trend={5}
                        />
                        <StatsCard
                            title="Tổng ứng viên"
                            value={stats.total_applications || 0}
                            icon={Users}
                            description="Tất cả ứng tuyển"
                        />
                    </>
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                    <span>
                                        {user?.role === 'student' ? 'Ứng tuyển gần đây' : 'Nhiệm vụ gần đây'}
                                    </span>
                                </CardTitle>
                                <Link to="/tasks">
                                    <Button variant="ghost" size="sm" className="group">
                                        Xem tất cả
                                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {user?.role === 'student' ? (
                                <div className="space-y-4">
                                    {dashboardData?.dashboard?.recent_applications?.length > 0 ? (
                                        dashboardData.dashboard.recent_applications.map((application) => (
                                            <div key={application.id} className="group border border-gray-200 rounded-xl p-4 hover:border-purple-200 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                            {application.task.title}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {application.task.company.company_name}
                                                        </p>
                                                        <div className="flex items-center space-x-4 mt-3">
                                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${application.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                application.status === 'accepted' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                                                    'bg-red-50 text-red-700 border border-red-200'
                                                                }`}>
                                                                {application.status === 'pending' ? 'Đang chờ duyệt' :
                                                                    application.status === 'accepted' ? 'Đã chấp nhận' : 'Bị từ chối'}
                                                            </span>
                                                            <span className="text-sm text-gray-500 flex items-center">
                                                                <Coins className="h-3 w-3 mr-1" />
                                                                {application.task.reward_tokens} Token
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(application.applied_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState
                                            icon={Briefcase}
                                            title="Chưa có ứng tuyển nào"
                                            description="Hãy khám phá các nhiệm vụ thú vị và bắt đầu ứng tuyển ngay!"
                                            actionLabel="Tìm nhiệm vụ"
                                            action={<Link to="/tasks"><Button>Tìm nhiệm vụ</Button></Link>}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {dashboardData?.dashboard?.recent_tasks?.length > 0 ? (
                                        dashboardData.dashboard.recent_tasks.map((task) => (
                                            <div key={task.id} className="group border border-gray-200 rounded-xl p-4 hover:border-purple-200 hover:shadow-md transition-all duration-200">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                                            {task.title}
                                                        </h3>
                                                        <div className="flex items-center space-x-4 mt-3">
                                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${task.status === 'open' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                                                task.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                                    'bg-teal-50 text-teal-700 border border-teal-200'
                                                                }`}>
                                                                {task.status === 'open' ? 'Đang mở' :
                                                                    task.status === 'in_progress' ? 'Đang thực hiện' : 'Hoàn thành'}
                                                            </span>
                                                            <span className="text-sm text-gray-500 flex items-center">
                                                                <Users className="h-3 w-3 mr-1" />
                                                                {task.applications?.length || 0} ứng viên
                                                            </span>
                                                            <span className="text-sm text-gray-500 flex items-center">
                                                                <Coins className="h-3 w-3 mr-1" />
                                                                {task.reward_tokens} Token
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(task.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <EmptyState
                                            icon={Briefcase}
                                            title="Chưa có nhiệm vụ nào"
                                            description="Tạo nhiệm vụ đầu tiên để bắt đầu tuyển dụng tài năng trẻ!"
                                            actionLabel="Tạo nhiệm vụ"
                                            action={<Link to="/tasks/create"><Button>Tạo nhiệm vụ</Button></Link>}
                                        />
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions & Insights */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-purple-600" />
                                <span>Hành động nhanh</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {user?.role === 'student' ? (
                                <>
                                    <Link to="/tasks" className="block">
                                        <Button variant="gradient" className="w-full justify-start group">
                                            <Briefcase className="h-4 w-4 mr-2" />
                                            Tìm nhiệm vụ mới
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link to="/profile" className="block">
                                        <Button variant="outline" className="w-full justify-start group">
                                            <Users className="h-4 w-4 mr-2" />
                                            Cập nhật hồ sơ
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link to="/tokens" className="block">
                                        <Button variant="outline" className="w-full justify-start group">
                                            <Coins className="h-4 w-4 mr-2" />
                                            Lịch sử Token
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/tasks/create" className="block">
                                        <Button variant="gradient" className="w-full justify-start group">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tạo nhiệm vụ mới
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link to="/tasks" className="block">
                                        <Button variant="outline" className="w-full justify-start group">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Quản lý nhiệm vụ
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                    <Link to="/analytics" className="block">
                                        <Button variant="outline" className="w-full justify-start group">
                                            <TrendingUp className="h-4 w-4 mr-2" />
                                            Xem thống kê
                                            <ArrowRight className="ml-auto h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Featured Tasks/Opportunities */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Star className="h-5 w-5 text-amber-500" />
                                <span>
                                    {user?.role === 'student' ? 'Nhiệm vụ nổi bật' : 'Thông tin hữu ích'}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {user?.role === 'student' ? (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                                        <h4 className="font-semibold text-gray-900 mb-2">🚀 Nhiệm vụ hot nhất tuần</h4>
                                        <p className="text-sm text-gray-600 mb-3">
                                            Phát triển ứng dụng React Native cho startup công nghệ
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-purple-600">500 Token</span>
                                            <Button size="sm">Xem ngay</Button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                                        <h4 className="font-semibold text-gray-900 mb-2">💡 Mẹo thành công</h4>
                                        <p className="text-sm text-gray-600">
                                            Hoàn thiện hồ sơ để tăng 70% cơ hội được chấp nhận
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                                        <h4 className="font-semibold text-gray-900 mb-2">📊 Xu hướng tuyển dụng</h4>
                                        <p className="text-sm text-gray-600">
                                            React, Node.js và Python là những kỹ năng được tìm kiếm nhiều nhất
                                        </p>
                                    </div>

                                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                                        <h4 className="font-semibold text-gray-900 mb-2">⭐ Đánh giá cao</h4>
                                        <p className="text-sm text-gray-600">
                                            Công ty của bạn có rating 4.8/5 từ sinh viên
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;