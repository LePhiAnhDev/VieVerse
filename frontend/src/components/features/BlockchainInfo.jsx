import React, { useState, useEffect, useRef } from "react";
import { useWeb3 } from "../../contexts/Web3Context";
import {
  studentService,
  companyService,
  mainAPI,
} from "../../services/blockchainService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import LoadingSpinner from "../common/LoadingSpinner";
import {
  Wallet,
  Coins,
  TrendingUp,
  User,
  Building,
  CheckCircle,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";

const BlockchainInfo = ({ user }) => {
  const { account, isConnected, connectWallet } = useWeb3();

  const [blockchainInfo, setBlockchainInfo] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);

  // Use refs to track if data has been fetched
  const blockchainDataFetched = useRef(false);
  const registrationStatusFetched = useRef(false);

  // Reset fetch flags when account or user changes
  useEffect(() => {
    blockchainDataFetched.current = false;
    registrationStatusFetched.current = false;
  }, [account, user?.id]);

  useEffect(() => {
    if (isConnected && account && user && !blockchainDataFetched.current && !loading) {
      blockchainDataFetched.current = true;
      fetchBlockchainData();
    }
  }, [isConnected, account, user, loading]);

  // Fetch registration status
  useEffect(() => {
    if (user && !registrationStatusFetched.current) {
      registrationStatusFetched.current = true;
      fetchRegistrationStatus();
    }
  }, [user]);

  const fetchBlockchainData = async () => {
    if (!account || !user) return;

    setLoading(true);
    try {
      // Fetch user info from blockchain
      if (user?.role === "student") {
        const studentResult = await studentService.getStudent(account);
        if (studentResult.success) {
          setBlockchainInfo(studentResult.student);
        } else {
          console.log("Student not registered on blockchain yet");
          setBlockchainInfo(null);
        }
      } else if (user?.role === "company") {
        const companyResult = await companyService.getCompany(account);
        if (companyResult.success) {
          // Parse company data from array format
          const companyData = companyResult.company;
          if (Array.isArray(companyData)) {
            // Convert array to object format
            const parsedData = {
              name: companyData[0],
              description: companyData[1],
              isVerified: companyData[2],
              totalTasks: parseInt(companyData[3]) || 0,
              completedTasks: parseInt(companyData[4]) || 0,
              totalRewardsDistributed: parseInt(companyData[5]) || 0,
              verificationCount: parseInt(companyData[6]) || 0,
              lastVerificationAt: parseInt(companyData[7]) || 0,
            };
            setBlockchainInfo(parsedData);
          } else {
            // If already object format, use as is
            setBlockchainInfo(companyData);
          }
        } else {
          console.log("Company not registered on blockchain yet");
          setBlockchainInfo(null);
        }
      }
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
      setBlockchainInfo(null);
      // Don't show error toast for this as it's not critical
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const response = await mainAPI.get("/blockchain-registration/status");
      setRegistrationStatus(response.data.registration);
    } catch (error) {
      console.error("Error fetching registration status:", error);
    }
  };

  const handleConnectWallet = async () => {
    const connectedAccount = await connectWallet();
    if (connectedAccount) {
      toast.success("Ví đã được kết nối!", { id: "wallet-connected" });
    }
  };

  const handleRegisterBlockchain = async () => {
    if (!isConnected || !account) {
      toast.error("Vui lòng kết nối ví trước!", { id: "wallet-not-connected" });
      return;
    }

    setRegistering(true);
    try {
      if (user?.role === "student") {
        // Đăng ký sinh viên - được xác thực ngay
        const result = await studentService.registerStudent({
          name: user.name,
          skills: user.skills || [],
          address: account,
        });

        if (result.success) {
          toast.success(
            "Đăng ký blockchain thành công! Sinh viên đã được xác thực.",
            { id: "student-register-success" }
          );
          // Reset flags to allow refetch
          blockchainDataFetched.current = false;
          registrationStatusFetched.current = false;
          // Refresh data
          fetchBlockchainData();
          fetchRegistrationStatus();
        } else {
          toast.error(result.error || "Đăng ký thất bại", {
            id: "student-register-error",
          });
        }
      } else if (user?.role === "company") {
        // Đăng ký doanh nghiệp - cần admin duyệt
        const result = await companyService.registerCompany({
          name: user.company_name || user.name,
          description: user.description || "",
          address: account,
        });

        if (result.success) {
          toast.success(
            "Đăng ký blockchain thành công! Đang chờ admin xác thực.",
            { id: "company-register-success" }
          );
          // Reset flags to allow refetch
          blockchainDataFetched.current = false;
          registrationStatusFetched.current = false;
          // Refresh data
          fetchBlockchainData();
          fetchRegistrationStatus();
        } else {
          toast.error(result.error || "Đăng ký thất bại", {
            id: "company-register-error",
          });
        }
      }
    } catch (error) {
      console.error("Error registering on blockchain:", error);
      toast.error("Lỗi đăng ký blockchain: " + error.message, {
        id: "blockchain-register-error",
      });
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
      {/* Wallet Connected but No Blockchain Registration */}
      {isConnected && !blockchainInfo && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {user?.role === "student" ? (
                <User className="h-5 w-5 text-green-600" />
              ) : (
                <Building className="h-5 w-5 text-blue-600" />
              )}
              <span>
                {registrationStatus?.status === "pending" 
                  ? "Trạng thái Đăng ký Blockchain"
                  : "Đăng ký Blockchain"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrationStatus?.status === "pending" ? (
              // Hiển thị trạng thái chờ xác thực
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center mb-3">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <h3 className="font-semibold text-yellow-800 mb-2">
                    Đang chờ admin xác thực
                  </h3>
                  <p className="text-sm text-yellow-700">
                    {user?.role === "student" 
                      ? "Yêu cầu đăng ký của bạn đang được xem xét. Bạn sẽ nhận được thông báo khi được xác thực."
                      : "Yêu cầu đăng ký doanh nghiệp đang được admin xem xét. Quá trình này có thể mất 1-2 ngày làm việc."}
                  </p>
                </div>
                
                {/* Thông tin đăng ký */}
                <div className="bg-gray-50 p-3 rounded-lg text-left">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tên:</span>
                      <span className="font-medium">{registrationStatus.name}</span>
                    </div>
                    {registrationStatus.description && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mô tả:</span>
                        <span className="font-medium text-right max-w-[200px] truncate">
                          {registrationStatus.description}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ví:</span>
                      <span className="font-mono text-xs">
                        {registrationStatus.wallet_address?.slice(0, 6)}...
                        {registrationStatus.wallet_address?.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thời gian:</span>
                      <span className="text-xs">
                        {new Date(registrationStatus.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : registrationStatus?.status === "rejected" ? (
              // Hiển thị trạng thái bị từ chối
              <div className="text-center space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">
                    Yêu cầu đăng ký bị từ chối
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    {registrationStatus.rejection_reason || "Không có lý do cụ thể."}
                  </p>
                  <Button
                    onClick={handleRegisterBlockchain}
                    loading={registering}
                    disabled={registering}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Đăng ký lại
                  </Button>
                </div>
              </div>
            ) : (
              // Hiển thị form đăng ký mới
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Ví đã được kết nối nhưng chưa đăng ký trên blockchain.
                  {user?.role === "student" 
                    ? " Đăng ký để bắt đầu nhận nhiệm vụ và kiếm token!"
                    : " Đăng ký để có thể tạo nhiệm vụ và tuyển dụng tài năng!"}
                </p>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Lưu ý:</strong> 
                    {user?.role === "student" 
                      ? " Sinh viên sẽ được xác thực ngay sau khi đăng ký."
                      : " Doanh nghiệp cần chờ admin xác thực sau khi đăng ký."}
                  </p>
                </div>
                <Button
                  onClick={handleRegisterBlockchain}
                  loading={registering}
                  disabled={registering}
                  className={`w-full ${
                    user?.role === "student" 
                      ? "bg-green-600 hover:bg-green-700" 
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white`}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {registering ? "Đang đăng ký..." : "Đăng ký Blockchain"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Đang tải thông tin Blockchain</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <LoadingSpinner size="sm" text="Đang kiểm tra trạng thái đăng ký..." />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blockchain Profile - When Registered */}
      {blockchainInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {user?.role === "student" ? (
                <User className="h-5 w-5 text-green-600" />
              ) : (
                <Building className="h-5 w-5 text-blue-600" />
              )}
              <span>Thông tin Blockchain</span>
              {user?.role === "company" && blockchainInfo.isVerified && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.role === "student" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tổng nhiệm vụ:
                    </span>
                    <span className="font-medium">
                      {blockchainInfo.totalTasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hoàn thành:</span>
                    <span className="font-medium">
                      {blockchainInfo.completedTasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tổng token:</span>
                    <span className="font-medium">
                      {blockchainInfo.totalRewards || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Điểm uy tín:</span>
                    <span className="font-medium">
                      {blockchainInfo.reputationScore || 500}
                    </span>
                  </div>

                  {/* Hiển thị trạng thái đăng ký cho student (nếu có) */}
                  {registrationStatus && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-600">
                          Trạng thái đăng ký:{" "}
                        </span>
                        <span
                          className={`font-medium ${
                            registrationStatus.status === "approved"
                              ? "text-green-600"
                              : registrationStatus.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {registrationStatus.status === "approved"
                            ? "Đã xác thực"
                            : registrationStatus.status === "pending"
                            ? "Đang chờ duyệt"
                            : "Bị từ chối"}
                        </span>
                      </div>
                      {registrationStatus.status === "rejected" &&
                        registrationStatus.rejection_reason && (
                          <div className="text-xs text-red-600 mt-1">
                            Lý do: {registrationStatus.rejection_reason}
                          </div>
                        )}
                    </div>
                  )}
                </>
              )}
              {user?.role === "company" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tổng nhiệm vụ:
                    </span>
                    <span className="font-medium">
                      {blockchainInfo.totalTasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hoàn thành:</span>
                    <span className="font-medium">
                      {blockchainInfo.completedTasks || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tổng token phân phối:
                    </span>
                    <span className="font-medium">
                      {blockchainInfo.totalRewardsDistributed || 0}
                    </span>
                  </div>
                  {/* Trạng thái đăng ký - ưu tiên blockchain status */}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Trạng thái đăng ký:
                    </span>
                    <span
                      className={`font-medium ${
                        blockchainInfo.isVerified
                          ? "text-green-600"
                          : "text-amber-600"
                      }`}
                    >
                      {blockchainInfo.isVerified
                        ? "Đã xác thực"
                        : "Chưa xác thực"}
                    </span>
                  </div>

                  {/* Hiển thị trạng thái đăng ký từ database (chỉ khi chưa xác thực trên blockchain) */}
                  {registrationStatus && !blockchainInfo.isVerified && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm">
                        <span className="text-gray-600">
                          Trạng thái yêu cầu:{" "}
                        </span>
                        <span
                          className={`font-medium ${
                            registrationStatus.status === "approved"
                              ? "text-green-600"
                              : registrationStatus.status === "pending"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {registrationStatus.status === "approved"
                            ? "Đã duyệt"
                            : registrationStatus.status === "pending"
                            ? "Đang chờ duyệt"
                            : "Bị từ chối"}
                        </span>
                      </div>
                      {registrationStatus.status === "rejected" &&
                        registrationStatus.rejection_reason && (
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
