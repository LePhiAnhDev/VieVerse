import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import {
  Building,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { mainAPI } from "../services/blockchainService";
import toast from "react-hot-toast";
import { formatDate } from "../utils/formatters";

const AdminPanel = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  
  // Use refs to track if data has been fetched
  const dataFetched = useRef(false);

  useEffect(() => {
    if (user?.role === "admin" && !dataFetched.current) {
      dataFetched.current = true;
      fetchPendingRegistrations();
    }
  }, [user]);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await mainAPI.get("/blockchain-registration/pending");
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error("Error fetching pending registrations:", error);
      toast.error("Không thể tải danh sách yêu cầu đăng ký", {
        id: "admin-fetch-error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (registrationId, action, rejectionReason = "") => {
    // Prevent duplicate calls
    if (processing[registrationId]) return;
    
    setProcessing((prev) => ({ ...prev, [registrationId]: true }));

    try {
      const response = await mainAPI.post(
        "/blockchain-registration/company/verify",
        {
          registrationId,
          action,
          rejectionReason,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message, { 
          id: `admin-verify-success-${registrationId}` 
        });
        fetchPendingRegistrations(); // Refresh list
      } else {
        toast.error(response.data.error || "Có lỗi xảy ra", {
          id: `admin-verify-response-error-${registrationId}`,
        });
      }
    } catch (error) {
      console.error("Error verifying registration:", error);
      toast.error(error.response?.data?.error || "Có lỗi xảy ra khi duyệt", {
        id: `admin-verify-catch-error-${registrationId}`,
      });
    } finally {
      setProcessing((prev) => ({ ...prev, [registrationId]: false }));
    }
  };

  // Kiểm tra quyền admin
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600">
            Bạn cần quyền admin để truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <LoadingSpinner
        size="lg"
        text="Đang tải danh sách yêu cầu đăng ký..."
        fullScreen
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">
              Quản lý yêu cầu đăng ký blockchain
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {registrations.length}
              </div>
              <div className="text-sm text-gray-600">Yêu cầu chờ duyệt</div>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        {registrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có yêu cầu nào
              </h3>
              <p className="text-gray-600">
                Tất cả yêu cầu đăng ký đã được xử lý.
              </p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((registration) => (
            <Card
              key={registration.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {registration.role === "company" ? (
                      <Building className="h-6 w-6 text-blue-600" />
                    ) : (
                      <User className="h-6 w-6 text-green-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {registration.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {registration.user?.email} •{" "}
                        {registration.role === "company"
                          ? "Doanh nghiệp"
                          : "Sinh viên"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Chờ duyệt
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Company Details */}
                  {registration.role === "company" &&
                    registration.description && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Mô tả công ty:
                        </h4>
                        <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                          {registration.description}
                        </p>
                      </div>
                    )}

                  {/* Student Skills */}
                  {registration.role === "student" &&
                    registration.skills &&
                    registration.skills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Kỹ năng:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {registration.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Wallet Address */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Địa chỉ ví:
                    </h4>
                    <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
                      {registration.wallet_address}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <div className="text-sm text-gray-500">
                    Yêu cầu được gửi: {formatDate(registration.created_at)}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      onClick={() => handleVerify(registration.id, "approve")}
                      loading={processing[registration.id]}
                      disabled={processing[registration.id]}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Duyệt
                    </Button>
                    <Button
                      onClick={() => {
                        const reason = prompt(
                          "Lý do từ chối (không bắt buộc):"
                        );
                        if (reason !== null) {
                          handleVerify(registration.id, "reject", reason);
                        }
                      }}
                      loading={processing[registration.id]}
                      disabled={processing[registration.id]}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
