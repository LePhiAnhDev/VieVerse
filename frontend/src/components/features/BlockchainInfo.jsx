import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { studentService, companyService, mainAPI } from '../../services/blockchainService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Wallet, Coins, TrendingUp, User, Building, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainInfo = ({ user }) => {
    const { account, isConnected, connectWallet } = useWeb3();

    const [blockchainInfo, setBlockchainInfo] = useState(null);
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        if (isConnected && account) {
            fetchBlockchainData();
        }
    }, [isConnected, account]);

    // Fetch registration status
    useEffect(() => {
        if (user) {
            fetchRegistrationStatus();
        }
    }, [user]);

    const fetchBlockchainData = async () => {
        if (!account) return;

        setLoading(true);
        try {
            // Fetch user info from blockchain
            if (user?.role === 'student') {
                const studentResult = await studentService.getStudent(account);
                if (studentResult.success) {
                    setBlockchainInfo(studentResult.student);
                }
            } else if (user?.role === 'company') {
                const companyResult = await companyService.getCompany(account);
                if (companyResult.success) {
                    setBlockchainInfo(companyResult.company);
                }
            }
        } catch (error) {
            console.error('Error fetching blockchain data:', error);
            // Don't show error toast for this as it's not critical
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrationStatus = async () => {
        try {
            const response = await mainAPI.get('/blockchain-registration/status');
            setRegistrationStatus(response.data.registration);
        } catch (error) {
            console.error('Error fetching registration status:', error);
        }
    };

    const handleConnectWallet = async () => {
        const connectedAccount = await connectWallet();
        if (connectedAccount) {
            toast.success('Ví đã được kết nối!');
        }
    };

    const handleRegisterBlockchain = async () => {
        if (!isConnected || !account) {
            toast.error('Vui lòng kết nối ví trước!');
            return;
        }

        setRegistering(true);
        try {
            if (user?.role === 'student') {
                // Đăng ký sinh viên - được xác thực ngay
                const result = await studentService.registerStudent({
                    name: user.name,
                    skills: user.skills || [],
                    address: account
                });

                if (result.success) {
                    toast.success('Đăng ký blockchain thành công! Sinh viên đã được xác thực.');
                    fetchBlockchainData(); // Refresh data
                    fetchRegistrationStatus(); // Refresh registration status
                } else {
                    toast.error(result.error || 'Đăng ký thất bại');
                }
            } else if (user?.role === 'company') {
                // Đăng ký doanh nghiệp - cần admin duyệt
                const result = await companyService.registerCompany({
                    name: user.company_name || user.name,
                    description: user.description || '',
                    address: account
                });

                if (result.success) {
                    toast.success('Đăng ký blockchain thành công! Đang chờ admin xác thực.');
                    fetchBlockchainData(); // Refresh data
                    fetchRegistrationStatus(); // Refresh registration status
                } else {
                    toast.error(result.error || 'Đăng ký thất bại');
                }
            }
        } catch (error) {
            console.error('Error registering on blockchain:', error);
            toast.error('Lỗi đăng ký blockchain: ' + error.message);
        } finally {
            setRegistering(false);
        }
    };

    if (!isConnected) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Wallet className="h-5 w-5 text-blue-600" />
                        <span>Kết nối Blockchain</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center space-y-4">
                        <p className="text-gray-600">
                            Kết nối ví MetaMask để xem thông tin blockchain và token balance
                        </p>
                        <Button onClick={handleConnectWallet}>
                            <Wallet className="h-4 w-4 mr-2" />
                            Kết nối MetaMask
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Blockchain Profile */}
            {blockchainInfo && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            {user?.role === 'student' ? (
                                <User className="h-5 w-5 text-green-600" />
                            ) : (
                                <Building className="h-5 w-5 text-blue-600" />
                            )}
                            <span>Thông tin Blockchain</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {user?.role === 'student' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tổng nhiệm vụ:</span>
                                        <span className="font-medium">{blockchainInfo.totalTasks || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Hoàn thành:</span>
                                        <span className="font-medium">{blockchainInfo.completedTasks || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tổng token:</span>
                                        <span className="font-medium">{blockchainInfo.totalRewards || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Điểm uy tín:</span>
                                        <span className="font-medium">{blockchainInfo.reputationScore || 500}</span>
                                    </div>

                                    {/* Nút đăng ký blockchain cho student */}
                                    {!blockchainInfo.isRegistered && !registrationStatus && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <Button
                                                onClick={handleRegisterBlockchain}
                                                loading={registering}
                                                disabled={registering}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Đăng ký Blockchain
                                            </Button>
                                        </div>
                                    )}

                                    {/* Hiển thị trạng thái đăng ký cho student */}
                                    {registrationStatus && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-sm">
                                                <span className="text-gray-600">Trạng thái đăng ký: </span>
                                                <span className={`font-medium ${registrationStatus.status === 'approved' ? 'text-green-600' :
                                                    registrationStatus.status === 'pending' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {registrationStatus.status === 'approved' ? 'Đã xác thực' :
                                                        registrationStatus.status === 'pending' ? 'Đang chờ duyệt' :
                                                            'Bị từ chối'}
                                                </span>
                                            </div>
                                            {registrationStatus.status === 'rejected' && registrationStatus.rejection_reason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Lý do: {registrationStatus.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                            {user?.role === 'company' && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tổng nhiệm vụ:</span>
                                        <span className="font-medium">{blockchainInfo.totalTasks || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Hoàn thành:</span>
                                        <span className="font-medium">{blockchainInfo.completedTasks || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Tổng token phân phối:</span>
                                        <span className="font-medium">{blockchainInfo.totalRewardsDistributed || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Trạng thái đăng ký:</span>
                                        <span className={`font-medium ${blockchainInfo.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                            {blockchainInfo.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </span>
                                    </div>
                                    {/* Nút đăng ký blockchain cho company */}
                                    {!blockchainInfo.isVerified && !registrationStatus && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <Button
                                                onClick={handleRegisterBlockchain}
                                                loading={registering}
                                                disabled={registering}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Đăng ký Blockchain
                                            </Button>
                                        </div>
                                    )}
                                    {/* Hiển thị trạng thái đăng ký */}
                                    {registrationStatus && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="text-sm">
                                                <span className="text-gray-600">Trạng thái đăng ký: </span>
                                                <span className={`font-medium ${registrationStatus.status === 'approved' ? 'text-green-600' :
                                                    registrationStatus.status === 'pending' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>
                                                    {registrationStatus.status === 'approved' ? 'Đã xác thực' :
                                                        registrationStatus.status === 'pending' ? 'Đang chờ duyệt' :
                                                            'Bị từ chối'}
                                                </span>
                                            </div>
                                            {registrationStatus.status === 'rejected' && registrationStatus.rejection_reason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    Lý do: {registrationStatus.rejection_reason}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BlockchainInfo; 