import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import {
    Calendar,
    MapPin,
    Coins,
    Users,
    Building,
    ArrowLeft,
    Send,
    CheckCircle,
    Clock,
    AlertCircle,
    Globe,
    Star,
    Award,
    Briefcase
} from 'lucide-react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Textarea from '../components/ui/Textarea';
import { Modal, ModalHeader, ModalTitle, ModalFooter } from '../components/ui/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
    STATUS_LABELS,
    DIFFICULTY_LABELS,
    APPLICATION_STATUS_LABELS
} from '../utils/constants';
import {
    isDeadlinePassed,
    canUserApplyToTask,
    getAvatarUrl,
    truncateText
} from '../utils/helpers';
import { formatDate, formatDateTime } from '../utils/formatters';
import toast from 'react-hot-toast';

const TaskDetail = () => {
    const { id } = useParams();
    const { user, updateProfile } = useAuth();
    const { connectWallet, isConnected, account, chainId } = useWeb3();
    const [walletLoading, setWalletLoading] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [task, setTask] = useState(null);
    const [userApplication, setUserApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [coverLetter, setCoverLetter] = useState('');
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        fetchTaskDetail();
    }, [id]);

    const fetchTaskDetail = async () => {
        try {
            const response = await axios.get(`/tasks/${id}`);
            setTask(response.data.task);
            setUserApplication(response.data.user_application);
        } catch (error) {
            console.error('Error fetching task detail:', error);
            toast.error('Không thể tải chi tiết nhiệm vụ');
            navigate('/tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async () => {
        if (!coverLetter.trim()) {
            toast.error('Vui lòng viết thư xin việc');
            return;
        }

        setApplying(true);
        try {
            await axios.post(`/tasks/${id}/apply`, {
                cover_letter: coverLetter
            });
            toast.success('Ứng tuyển thành công!');
            setShowApplyModal(false);
            setCoverLetter('');
            fetchTaskDetail(); // Refresh data
        } catch (error) {
            const message = error.response?.data?.error || 'Có lỗi xảy ra khi ứng tuyển';
            toast.error(message);
        } finally {
            setApplying(false);
        }
    };

    const handleConnectWallet = async () => {
        if (!isConnected) {
            await connectWallet();
        }
        if (account && chainId === 11155111) {
            setWalletLoading(true);
            try {
                await axios.put('/auth/connect-wallet', { wallet_address: account });
                await updateProfile({}); // Refresh user info
                setShowWalletModal(false);
                toast.success('Đã liên kết ví thành công!');
            } catch (err) {
                toast.error('Lỗi liên kết ví');
            } finally {
                setWalletLoading(false);
            }
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'open': return 'primary';
            case 'in_progress': return 'warning';
            case 'completed': return 'success';
            case 'cancelled': return 'danger';
            default: return 'default';
        }
    };

    const getDifficultyBadgeVariant = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'default';
        }
    };

    const getApplicationStatusBadgeVariant = (status) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'accepted': return 'success';
            case 'rejected': return 'danger';
            default: return 'default';
        }
    };

    if (loading) {
        return <LoadingSpinner size="lg" text="Đang tải chi tiết nhiệm vụ..." fullScreen />;
    }

    if (!task) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <EmptyState
                    icon={Briefcase}
                    title="Không tìm thấy nhiệm vụ"
                    description="Nhiệm vụ này có thể đã bị xóa hoặc không tồn tại."
                    actionLabel="Về danh sách nhiệm vụ"
                    onAction={() => navigate('/tasks')}
                />
            </div>
        );
    }

    const canApply = canUserApplyToTask(user, task, userApplication);
    const deadlinePassed = isDeadlinePassed(task.deadline);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {/* Back Button */}
            <div>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/tasks')}
                    className="mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Task Header */}
                    <Card className="overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <img
                                            src={getAvatarUrl(task.company?.company_name || task.company?.name)}
                                            alt={task.company?.company_name || task.company?.name}
                                            className="h-12 w-12 rounded-full border-2 border-white shadow-sm"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {task.company?.company_name || task.company?.name}
                                            </h3>
                                            {task.company?.is_verified && (
                                                <div className="flex items-center space-x-1">
                                                    <CheckCircle className="h-4 w-4 text-blue-500" />
                                                    <span className="text-sm text-blue-600">Đã xác minh</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{task.title}</h1>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <Badge variant={getStatusBadgeVariant(task.status)}>
                                            {STATUS_LABELS[task.status]}
                                        </Badge>
                                        <Badge variant={getDifficultyBadgeVariant(task.difficulty)}>
                                            {DIFFICULTY_LABELS[task.difficulty]}
                                        </Badge>
                                        {deadlinePassed && (
                                            <Badge variant="danger">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Đã hết hạn
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {canApply && (
                                    <Button
                                        variant="gradient"
                                        size="lg"
                                        onClick={() => {
                                            if (!user?.wallet_address) {
                                                setShowWalletModal(true);
                                            } else {
                                                setShowApplyModal(true);
                                            }
                                        }}
                                        className="ml-4 shadow-lg"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Ứng tuyển ngay
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        {/* User Application Status */}
                        {userApplication && (
                            <div className="p-6 bg-gray-50 border-b">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Trạng thái ứng tuyển của bạn</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Ứng tuyển vào {formatDateTime(userApplication.applied_at)}
                                        </p>
                                    </div>
                                    <Badge variant={getApplicationStatusBadgeVariant(userApplication.status)} size="lg">
                                        {userApplication.status === 'pending' && <Clock className="h-4 w-4 mr-2" />}
                                        {userApplication.status === 'accepted' && <CheckCircle className="h-4 w-4 mr-2" />}
                                        {userApplication.status === 'rejected' && <AlertCircle className="h-4 w-4 mr-2" />}
                                        {APPLICATION_STATUS_LABELS[userApplication.status]}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Key Metrics */}
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <Coins className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">{task.reward_tokens}</p>
                                    <p className="text-sm text-gray-600">Token</p>
                                </div>

                                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                    <p className="text-2xl font-bold text-gray-900">
                                        {task.current_applicants}/{task.max_applicants}
                                    </p>
                                    <p className="text-sm text-gray-600">Ứng viên</p>
                                </div>

                                <div className="text-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <Calendar className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatDate(task.deadline)}
                                    </p>
                                    <p className="text-sm text-gray-600">Deadline</p>
                                </div>

                                <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <MapPin className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                    <p className="text-lg font-bold text-gray-900">
                                        {task.is_remote ? 'Remote' : 'Tại chỗ'}
                                    </p>
                                    <p className="text-sm text-gray-600">Địa điểm</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Mô tả công việc</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {task.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Requirements */}
                    {task.requirements && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Yêu cầu công việc</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {task.requirements}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Skills Required */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Kỹ năng yêu cầu</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {task.skills_required?.map((skill, index) => (
                                    <Badge key={index} variant="secondary" size="lg">
                                        <Star className="h-3 w-3 mr-1" />
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Company Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building className="h-5 w-5 mr-2" />
                                Thông tin công ty
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={getAvatarUrl(task.company?.company_name || task.company?.name, 64)}
                                    alt={task.company?.company_name || task.company?.name}
                                    className="h-16 w-16 rounded-full border-2 border-gray-200"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        {task.company?.company_name || task.company?.name}
                                    </h3>
                                    <p className="text-sm text-gray-600">{task.company?.industry}</p>
                                    {task.company?.is_verified && (
                                        <div className="flex items-center space-x-1 mt-1">
                                            <CheckCircle className="h-3 w-3 text-blue-500" />
                                            <span className="text-xs text-blue-600">Công ty đã xác minh</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {task.company?.description && (
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {truncateText(task.company.description, 150)}
                                </p>
                            )}

                            {task.company?.website && (
                                <a
                                    href={task.company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                    <Globe className="h-4 w-4 mr-1" />
                                    Trang web công ty
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    {/* Task Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Award className="h-5 w-5 mr-2" />
                                Chi tiết nhiệm vụ
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Danh mục</p>
                                    <p className="text-gray-900">{task.category || 'Không xác định'}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngày đăng</p>
                                    <p className="text-gray-900">{formatDate(task.created_at)}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Cập nhật lần cuối</p>
                                    <p className="text-gray-900">{formatDate(task.updated_at)}</p>
                                </div>

                                {task.location && !task.is_remote && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Địa chỉ</p>
                                        <p className="text-gray-900">{task.location}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <CardHeader>
                            <CardTitle className="text-blue-900">Hành động nhanh</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Link to="/tasks">
                                <Button variant="outline" className="w-full">
                                    Xem nhiệm vụ khác
                                </Button>
                            </Link>

                            {user?.role === 'student' && (
                                <Link to="/profile">
                                    <Button variant="outline" className="w-full">
                                        Cập nhật hồ sơ
                                    </Button>
                                </Link>
                            )}

                            <Button
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    navigator.share?.({
                                        title: task.title,
                                        text: task.description,
                                        url: window.location.href
                                    }) || navigator.clipboard?.writeText(window.location.href);
                                    toast.success('Đã sao chép link!');
                                }}
                            >
                                Chia sẻ nhiệm vụ
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Apply Modal */}
            <Modal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                size="lg"
            >
                <ModalHeader>
                    <ModalTitle>Ứng tuyển nhiệm vụ</ModalTitle>
                    <div className="mt-2">
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.company?.company_name || task.company?.name}</p>
                    </div>
                </ModalHeader>

                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                            Thư xin việc <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            id="coverLetter"
                            value={coverLetter}
                            onChange={(e) => setCoverLetter(e.target.value)}
                            placeholder="Viết vài dòng về lý do bạn muốn ứng tuyển vào nhiệm vụ này, kinh nghiệm và kỹ năng của bạn..."
                            rows={8}
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Hãy viết một thư xin việc ấn tượng để tăng cơ hội được chấp nhận
                        </p>
                    </div>
                </div>

                <ModalFooter>
                    <Button
                        variant="outline"
                        onClick={() => setShowApplyModal(false)}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="gradient"
                        onClick={handleApply}
                        loading={applying}
                        disabled={applying || !coverLetter.trim()}
                    >
                        Gửi ứng tuyển
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Modal yêu cầu liên kết ví nếu chưa có ví */}
            {showWalletModal && (
                <Modal open={showWalletModal} onClose={() => setShowWalletModal(false)}>
                    <ModalHeader>
                        <ModalTitle>Liên kết ví MetaMask</ModalTitle>
                    </ModalHeader>
                    <CardContent>
                        <p className="mb-4">Bạn cần liên kết ví MetaMask để ứng tuyển nhiệm vụ này.</p>
                        <Button onClick={handleConnectWallet} loading={walletLoading} disabled={walletLoading} className="bg-yellow-500 hover:bg-yellow-600 text-white w-full">
                            Kết nối & Liên kết ví
                        </Button>
                    </CardContent>
                    <ModalFooter>
                        <Button variant="ghost" onClick={() => setShowWalletModal(false)}>
                            Đóng
                        </Button>
                    </ModalFooter>
                </Modal>
            )}
        </div>
    );
};

export default TaskDetail;