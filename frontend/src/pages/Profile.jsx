import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Award,
  Coins,
  GraduationCap,
  Star,
  Lock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import {
  isValidEmail,
  isValidUrl,
  parseSkills,
  formatSkills,
  getAvatarUrl,
} from "../utils/helpers";
import { USER_ROLES } from "../utils/constants";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    // Student fields
    university: user?.university || "",
    major: user?.major || "",
    skills: formatSkills(user?.skills) || "",
    // Company fields
    company_name: user?.company_name || "",
    industry: user?.industry || "",
    description: user?.description || "",
    website: user?.website || "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên là bắt buộc";
    }

    if (user?.role === USER_ROLES.STUDENT) {
      if (!formData.university.trim()) {
        newErrors.university = "Trường đại học là bắt buộc";
      }
      if (!formData.major.trim()) {
        newErrors.major = "Ngành học là bắt buộc";
      }
    } else if (user?.role === USER_ROLES.COMPANY) {
      if (!formData.company_name.trim()) {
        newErrors.company_name = "Tên công ty là bắt buộc";
      }
      if (!formData.industry.trim()) {
        newErrors.industry = "Ngành nghề là bắt buộc";
      }
      if (formData.website && !isValidUrl(formData.website)) {
        newErrors.website = "Website phải bắt đầu bằng http:// hoặc https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.current_password) {
      newErrors.current_password = "Mật khẩu hiện tại là bắt buộc";
    }

    if (!passwordData.new_password) {
      newErrors.new_password = "Mật khẩu mới là bắt buộc";
    } else if (passwordData.new_password.length < 6) {
      newErrors.new_password = "Mật khẩu mới phải có ít nhất 6 ký tự";
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = "Xác nhận mật khẩu không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    setLoading(true);
    try {
      const updateData = { ...formData };
      if (user?.role === USER_ROLES.STUDENT) {
        updateData.skills = parseSkills(formData.skills);
      }

      const result = await updateProfile(updateData);
      if (result.success) {
        setIsEditing(false);
        toast.success("Cập nhật hồ sơ thành công!", {
          id: "profile-update-page-success",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      const message = error.response?.data?.error || "Cập nhật hồ sơ thất bại";
      toast.error(message, { id: "profile-update-page-error" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setLoading(true);
    try {
      const result = await changePassword(passwordData);
      if (result.success) {
        setShowChangePassword(false);
        setPasswordData({
          current_password: "",
          new_password: "",
          confirm_password: "",
        });
        toast.success("Đổi mật khẩu thành công!", {
          id: "password-change-page-success",
        });
      }
    } catch (error) {
      console.error("Change password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      university: user?.university || "",
      major: user?.major || "",
      skills: formatSkills(user?.skills) || "",
      company_name: user?.company_name || "",
      industry: user?.industry || "",
      description: user?.description || "",
      website: user?.website || "",
    });
    setIsEditing(false);
    setErrors({});
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  className="h-24 w-24 rounded-full border-4 border-white shadow-lg"
                  src={getAvatarUrl(user?.name, 96)}
                  alt={user?.name}
                />
                <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-2">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user?.name}
                </h1>
                <p className="text-lg text-gray-600 mt-1">
                  {user?.role === USER_ROLES.STUDENT
                    ? "🎓 Sinh viên"
                    : "🏢 Doanh nghiệp"}
                </p>
                {user?.role === USER_ROLES.STUDENT && (
                  <div className="flex items-center mt-3 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-2xl border-2 border-amber-200">
                    <Coins className="h-4 w-4 mr-2" />
                    <span className="font-semibold">
                      {user?.tokens || 0} Token
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowChangePassword(true)}
                    className="bg-white/80"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Đổi mật khẩu
                  </Button>
                  <Button variant="gradient" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Chỉnh sửa hồ sơ
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="bg-white/80"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Hủy
                  </Button>
                  <Button
                    variant="gradient"
                    onClick={handleSaveProfile}
                    loading={loading}
                    disabled={loading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Thông tin cơ bản
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tên đầy đủ <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                    icon={User}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <User className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">{user?.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">{user?.email}</span>
                <Badge variant="secondary" size="sm" className="ml-auto">
                  Không thể thay đổi
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0123456789"
                  icon={Phone}
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {user?.phone || "Chưa cập nhật"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                <Award className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-900">
                  {user?.role === USER_ROLES.STUDENT
                    ? "Sinh viên"
                    : "Doanh nghiệp"}
                </span>
                <Badge variant="primary" size="sm" className="ml-auto">
                  Cố định
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific Information */}
      {user?.role === USER_ROLES.STUDENT ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="h-5 w-5 mr-2" />
              Thông tin học tập
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Trường đại học <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      error={errors.university}
                      icon={Building}
                    />
                    {errors.university && (
                      <p className="text-sm text-red-600">
                        {errors.university}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Building className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.university || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ngành học <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      error={errors.major}
                      icon={Award}
                    />
                    {errors.major && (
                      <p className="text-sm text-red-600">{errors.major}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Award className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.major || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Kỹ năng
              </label>
              {isEditing ? (
                <div>
                  <Input
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="JavaScript, React, Node.js, Python..."
                    icon={Star}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Phân cách các kỹ năng bằng dấu phẩy
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user?.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          <Star className="h-3 w-3 mr-1" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <Star className="h-4 w-4 text-gray-400 mr-3" />
                      <span className="text-gray-500">
                        Chưa cập nhật kỹ năng
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Thông tin công ty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Tên công ty <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      error={errors.company_name}
                      icon={Building}
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-600">
                        {errors.company_name}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Building className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.company_name || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Ngành nghề <span className="text-red-500">*</span>
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      error={errors.industry}
                      icon={Award}
                    />
                    {errors.industry && (
                      <p className="text-sm text-red-600">{errors.industry}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Award className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {user?.industry || "Chưa cập nhật"}
                    </span>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Website
                </label>
                {isEditing ? (
                  <>
                    <Input
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      error={errors.website}
                      icon={Globe}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-600">{errors.website}</p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                    <Globe className="h-4 w-4 text-gray-400 mr-3" />
                    {user?.website ? (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {user.website}
                      </a>
                    ) : (
                      <span className="text-gray-500">Chưa cập nhật</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mô tả công ty
              </label>
              {isEditing ? (
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả về công ty của bạn..."
                  rows={4}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <p className="text-gray-900">
                    {user?.description || "Chưa có mô tả về công ty"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Change Password Modal */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        size="default"
      >
        <ModalHeader>
          <ModalTitle>Đổi mật khẩu</ModalTitle>
        </ModalHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <Input
              name="current_password"
              type="password"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              error={errors.current_password}
              icon={Lock}
            />
            {errors.current_password && (
              <p className="text-sm text-red-600">{errors.current_password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              name="new_password"
              type="password"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              error={errors.new_password}
              icon={Lock}
            />
            {errors.new_password && (
              <p className="text-sm text-red-600">{errors.new_password}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              name="confirm_password"
              type="password"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              error={errors.confirm_password}
              icon={Lock}
            />
            {errors.confirm_password && (
              <p className="text-sm text-red-600">{errors.confirm_password}</p>
            )}
          </div>
        </div>

        <ModalFooter>
          <Button
            variant="outline"
            onClick={() => setShowChangePassword(false)}
          >
            Hủy
          </Button>
          <Button
            variant="gradient"
            onClick={handleChangePassword}
            loading={loading}
            disabled={loading}
          >
            Đổi mật khẩu
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default Profile;
