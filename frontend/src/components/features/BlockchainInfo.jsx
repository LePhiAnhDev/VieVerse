import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { tokenService, studentService, companyService } from '../../services/blockchainService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Wallet, Coins, TrendingUp, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainInfo = ({ user }) => {
    const { account, isConnected, connectWallet } = useWeb3();
    const [tokenBalance, setTokenBalance] = useState(null);
    const [blockchainInfo, setBlockchainInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isConnected && account) {
            fetchBlockchainData();
        }
    }, [isConnected, account]);

    const fetchBlockchainData = async () => {
        if (!account) return;

        setLoading(true);
        try {
            // Fetch token balance
            const balanceResult = await tokenService.getBalance(account);
            if (balanceResult.success) {
                setTokenBalance(balanceResult.balance);
            }

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

    const handleConnectWallet = async () => {
        const connectedAccount = await connectWallet();
        if (connectedAccount) {
            toast.success('Ví đã được kết nối!');
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
            {/* Token Balance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Coins className="h-5 w-5 text-yellow-600" />
                        <span>Token Balance</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <LoadingSpinner size="sm" />
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl font-bold text-gray-900">
                                    {tokenBalance ? `${parseInt(tokenBalance) / Math.pow(10, 18)} VVT` : '0 VVT'}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={fetchBlockchainData}
                                >
                                    Refresh
                                </Button>
                            </div>
                            <p className="text-sm text-gray-600">
                                Địa chỉ: {account?.slice(0, 6)}...{account?.slice(-4)}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                                        <span className="text-sm text-gray-600">Trạng thái:</span>
                                        <span className={`font-medium ${blockchainInfo.isVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                            {blockchainInfo.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                        </span>
                                    </div>
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