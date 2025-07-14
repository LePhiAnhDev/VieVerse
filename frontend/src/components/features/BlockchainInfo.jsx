import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { studentService, companyService } from '../../services/blockchainService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { Wallet, Coins, TrendingUp, User, Building } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainInfo = ({ user }) => {
    const { account, isConnected, connectWallet } = useWeb3();

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