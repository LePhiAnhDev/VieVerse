import React, { useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { taskService, ipfsService } from '../../services/blockchainService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Modal from '../ui/Modal';
import { Plus, Upload, FileText, Coins, Calendar, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { TASK_DIFFICULTY, DIFFICULTY_LABELS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CreateTaskModal = ({ isOpen, onClose, onSuccess }) => {
    const { account, isConnected, chainId, connectWallet } = useWeb3();
    const { user, updateProfile } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requirements: '',
        skills_required: '',
        reward_tokens: '',
        deadline: '',
        difficulty: TASK_DIFFICULTY.INTERMEDIATE,
        category: '',
        max_applicants: '5'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: form, 2: blockchain creation
    const [walletLoading, setWalletLoading] = useState(false);

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

        if (!formData.title.trim()) {
            newErrors.title = 'Tiêu đề là bắt buộc';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Mô tả là bắt buộc';
        }

        if (!formData.reward_tokens) {
            newErrors.reward_tokens = 'Số token thưởng là bắt buộc';
        } else if (parseInt(formData.reward_tokens) < 1) {
            newErrors.reward_tokens = 'Số token phải lớn hơn 0';
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Deadline là bắt buộc';
        } else {
            const deadlineDate = new Date(formData.deadline);
            const now = new Date();
            if (deadlineDate <= now) {
                newErrors.deadline = 'Deadline phải trong tương lai';
            }
        }

        if (!formData.category.trim()) {
            newErrors.category = 'Danh mục là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Check wallet connection
        if (!isConnected) {
            toast.error('Vui lòng kết nối ví MetaMask trước!');
            return;
        }

        // Check network
        if (chainId !== 11155111) {
            toast.error('Vui lòng chuyển sang mạng Sepolia Testnet!');
            return;
        }

        setLoading(true);
        setStep(2);

        try {
            // Convert reward to Wei (18 decimals)
            const rewardInWei = (parseInt(formData.reward_tokens) * Math.pow(10, 18)).toString();

            // Convert deadline to Unix timestamp
            const deadlineTimestamp = Math.floor(new Date(formData.deadline).getTime() / 1000);

            // Create task on blockchain
            const blockchainResult = await taskService.createTask({
                title: formData.title,
                description: formData.description,
                reward: rewardInWei,
                deadline: deadlineTimestamp
            });

            if (!blockchainResult.success) {
                throw new Error(blockchainResult.error || 'Failed to create task on blockchain');
            }

            toast.success('Tạo nhiệm vụ thành công trên blockchain!');

            // Reset form
            setFormData({
                title: '',
                description: '',
                requirements: '',
                skills_required: '',
                reward_tokens: '',
                deadline: '',
                difficulty: TASK_DIFFICULTY.INTERMEDIATE,
                category: '',
                max_applicants: '5'
            });
            setStep(1);
            onSuccess && onSuccess(blockchainResult);
            onClose();

        } catch (error) {
            console.error('Error creating task:', error);
            toast.error(error.message || 'Tạo nhiệm vụ thất bại');
            setStep(1);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                title: '',
                description: '',
                requirements: '',
                skills_required: '',
                reward_tokens: '',
                deadline: '',
                difficulty: TASK_DIFFICULTY.INTERMEDIATE,
                category: '',
                max_applicants: '5'
            });
            setErrors({});
            setStep(1);
            onClose();
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
                await updateProfile({});
                toast.success('Đã liên kết ví thành công!');
            } catch (err) {
                toast.error('Lỗi liên kết ví');
            } finally {
                setWalletLoading(false);
            }
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-green-600" />
                        <span>Tạo nhiệm vụ mới</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Step indicator */}
                    {step === 2 && (
                        <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50">
                            <div className="flex items-center space-x-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <div>
                                    <h3 className="font-medium text-blue-900">Đang tạo nhiệm vụ trên Blockchain</h3>
                                    <p className="text-sm text-blue-700">Vui lòng chờ trong khi giao dịch được xử lý...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Wallet connection warning */}
                    {!user?.wallet_address && (
                        <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <div>
                                    <h3 className="font-medium text-amber-900">Liên kết ví bắt buộc</h3>
                                    <p className="text-sm text-amber-700">
                                        Bạn cần liên kết ví MetaMask với tài khoản để tạo nhiệm vụ mới.
                                    </p>
                                    <Button onClick={handleConnectWallet} loading={walletLoading} disabled={walletLoading} className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                                        Kết nối & Liên kết ví
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Network warning */}
                    {isConnected && chainId !== 11155111 && (
                        <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div>
                                    <h3 className="font-medium text-red-900">Sai mạng</h3>
                                    <p className="text-sm text-red-700">
                                        Vui lòng chuyển sang mạng Sepolia Testnet để tiếp tục.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form chỉ hiển thị nếu đã liên kết ví */}
                    {user?.wallet_address && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>

                                <div className="space-y-2">
                                    <label htmlFor="title" className="text-sm font-medium text-gray-700">
                                        Tiêu đề nhiệm vụ <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Nhập tiêu đề nhiệm vụ"
                                        value={formData.title}
                                        onChange={handleChange}
                                        error={errors.title}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="description" className="text-sm font-medium text-gray-700">
                                        Mô tả chi tiết <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Mô tả chi tiết về nhiệm vụ, yêu cầu, kỳ vọng..."
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        error={errors.description}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="requirements" className="text-sm font-medium text-gray-700">
                                        Yêu cầu kỹ thuật
                                    </label>
                                    <Textarea
                                        id="requirements"
                                        name="requirements"
                                        placeholder="Liệt kê các yêu cầu kỹ thuật cụ thể..."
                                        rows={3}
                                        value={formData.requirements}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Task Details */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Chi tiết nhiệm vụ</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="category" className="text-sm font-medium text-gray-700">
                                            Danh mục <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            id="category"
                                            name="category"
                                            placeholder="VD: Web Development, Mobile App..."
                                            value={formData.category}
                                            onChange={handleChange}
                                            error={errors.category}
                                        />
                                        {errors.category && (
                                            <p className="text-sm text-red-600">{errors.category}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="difficulty" className="text-sm font-medium text-gray-700">
                                            Độ khó
                                        </label>
                                        <Select
                                            id="difficulty"
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                        >
                                            {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="skills_required" className="text-sm font-medium text-gray-700">
                                        Kỹ năng yêu cầu
                                    </label>
                                    <Input
                                        id="skills_required"
                                        name="skills_required"
                                        placeholder="VD: React, Node.js, Python (phân cách bằng dấu phẩy)"
                                        value={formData.skills_required}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            {/* Reward & Deadline */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900">Thưởng & Thời hạn</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="reward_tokens" className="text-sm font-medium text-gray-700">
                                            Số token thưởng <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="reward_tokens"
                                                name="reward_tokens"
                                                type="number"
                                                placeholder="100"
                                                value={formData.reward_tokens}
                                                onChange={handleChange}
                                                error={errors.reward_tokens}
                                                className="pr-12"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <Coins className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.reward_tokens && (
                                            <p className="text-sm text-red-600">{errors.reward_tokens}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="deadline" className="text-sm font-medium text-gray-700">
                                            Deadline <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Input
                                                id="deadline"
                                                name="deadline"
                                                type="datetime-local"
                                                value={formData.deadline}
                                                onChange={handleChange}
                                                error={errors.deadline}
                                                className="pr-12"
                                            />
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>
                                        {errors.deadline && (
                                            <p className="text-sm text-red-600">{errors.deadline}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="max_applicants" className="text-sm font-medium text-gray-700">
                                        Số lượng ứng viên tối đa
                                    </label>
                                    <Input
                                        id="max_applicants"
                                        name="max_applicants"
                                        type="number"
                                        placeholder="5"
                                        value={formData.max_applicants}
                                        onChange={handleChange}
                                        min="1"
                                        max="20"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading || !isConnected || chainId !== 11155111}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Đang tạo...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tạo nhiệm vụ
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </Modal>
    );
};

export default CreateTaskModal; 