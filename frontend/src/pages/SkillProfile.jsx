import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Plus,
    Edit,
    Save,
    X,
    Trash2,
    Eye,
    EyeOff,
    BookOpen,
    Target,
    Briefcase,
    User,
    Calendar,
    GraduationCap,
    Star,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import {
    Modal,
    ModalHeader,
    ModalTitle,
    ModalFooter,
} from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
    getMySkillProfile,
    createOrUpdateSkillProfile,
    deleteSkillProfile,
    formatSkillLevel,
    getSkillLevelColor,
    validateSkillData,
    validateLearningGoal,
    validateInterestedField
} from '../services/skillProfileService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const SkillProfile = () => {
    const { user } = useAuth();
    const [skillProfile, setSkillProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        current_skills: [],
        learning_goals: [],
        interested_fields: [],
        summary: '',
        is_public: true
    });

    // Modal states
    const [showSkillModal, setShowSkillModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showFieldModal, setShowFieldModal] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);

    // Form states
    const [skillForm, setSkillForm] = useState({
        name: '',
        description: '',
        source: '',
        level: 'basic'
    });

    const [goalForm, setGoalForm] = useState({
        skill: '',
        reason: '',
        target_date: ''
    });

    const [fieldForm, setFieldForm] = useState({
        name: '',
        reason: ''
    });

    const [errors, setErrors] = useState({});

    // Load skill profile
    useEffect(() => {
        loadSkillProfile();
    }, []);

    const loadSkillProfile = async () => {
        try {
            setLoading(true);
            const response = await getMySkillProfile();
            setSkillProfile(response.skillProfile);
            setFormData({
                current_skills: response.skillProfile.current_skills || [],
                learning_goals: response.skillProfile.learning_goals || [],
                interested_fields: response.skillProfile.interested_fields || [],
                summary: response.skillProfile.summary || '',
                is_public: response.skillProfile.is_public
            });
        } catch (error) {
            if (error.error === 'Hồ sơ kỹ năng chưa được tạo') {
                // Profile doesn't exist yet, that's okay
                setSkillProfile(null);
            } else {
                toast.error(error.error || 'Lỗi khi tải hồ sơ kỹ năng');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const response = await createOrUpdateSkillProfile(formData);
            setSkillProfile(response.skillProfile);
            setIsEditing(false);
            toast.success(response.message);
        } catch (error) {
            toast.error(error.error || 'Lỗi khi lưu hồ sơ kỹ năng');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProfile = async () => {
        try {
            setSaving(true);
            await deleteSkillProfile();
            setSkillProfile(null);
            setFormData({
                current_skills: [],
                learning_goals: [],
                interested_fields: [],
                summary: '',
                is_public: true
            });
            setShowDeleteModal(false);
            toast.success('Xóa hồ sơ kỹ năng thành công');
        } catch (error) {
            toast.error(error.error || 'Lỗi khi xóa hồ sơ kỹ năng');
        } finally {
            setSaving(false);
        }
    };

    // Skill management
    const openSkillModal = (index = -1) => {
        setEditingIndex(index);
        if (index >= 0) {
            setSkillForm(formData.current_skills[index]);
        } else {
            setSkillForm({
                name: '',
                description: '',
                source: '',
                level: 'basic'
            });
        }
        setErrors({});
        setShowSkillModal(true);
    };

    const saveSkill = () => {
        const skillErrors = validateSkillData(skillForm);
        if (skillErrors.length > 0) {
            setErrors({ skill: skillErrors });
            return;
        }

        const newSkills = [...formData.current_skills];
        if (editingIndex >= 0) {
            newSkills[editingIndex] = { ...skillForm };
        } else {
            newSkills.push({ ...skillForm });
        }

        setFormData(prev => ({
            ...prev,
            current_skills: newSkills
        }));
        setShowSkillModal(false);
        setErrors({});
    };

    const deleteSkill = (index) => {
        const newSkills = formData.current_skills.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            current_skills: newSkills
        }));
    };

    // Learning goal management
    const openGoalModal = (index = -1) => {
        setEditingIndex(index);
        if (index >= 0) {
            setGoalForm(formData.learning_goals[index]);
        } else {
            setGoalForm({
                skill: '',
                reason: '',
                target_date: ''
            });
        }
        setErrors({});
        setShowGoalModal(true);
    };

    const saveGoal = () => {
        const goalErrors = validateLearningGoal(goalForm);
        if (goalErrors.length > 0) {
            setErrors({ goal: goalErrors });
            return;
        }

        const newGoals = [...formData.learning_goals];
        if (editingIndex >= 0) {
            newGoals[editingIndex] = { ...goalForm };
        } else {
            newGoals.push({ ...goalForm });
        }

        setFormData(prev => ({
            ...prev,
            learning_goals: newGoals
        }));
        setShowGoalModal(false);
        setErrors({});
    };

    const deleteGoal = (index) => {
        const newGoals = formData.learning_goals.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            learning_goals: newGoals
        }));
    };

    // Interested field management
    const openFieldModal = (index = -1) => {
        setEditingIndex(index);
        if (index >= 0) {
            setFieldForm(formData.interested_fields[index]);
        } else {
            setFieldForm({
                name: '',
                reason: ''
            });
        }
        setErrors({});
        setShowFieldModal(true);
    };

    const saveField = () => {
        const fieldErrors = validateInterestedField(fieldForm);
        if (fieldErrors.length > 0) {
            setErrors({ field: fieldErrors });
            return;
        }

        const newFields = [...formData.interested_fields];
        if (editingIndex >= 0) {
            newFields[editingIndex] = { ...fieldForm };
        } else {
            newFields.push({ ...fieldForm });
        }

        setFormData(prev => ({
            ...prev,
            interested_fields: newFields
        }));
        setShowFieldModal(false);
        setErrors({});
    };

    const deleteField = (index) => {
        const newFields = formData.interested_fields.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            interested_fields: newFields
        }));
    };

    if (loading) {
        return <LoadingSpinner size="xl" text="Đang tải hồ sơ kỹ năng..." fullScreen />;
    }

    if (!skillProfile && !isEditing) {
        return (
            <div className="space-y-8 animate-fade-in">
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                        <BookOpen className="w-12 h-12 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Chưa có hồ sơ kỹ năng
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Tạo hồ sơ kỹ năng để thể hiện khả năng và định hướng của bạn, giúp các công ty hiểu rõ hơn về bạn.
                    </p>
                    <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo hồ sơ kỹ năng
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <Card className="overflow-hidden bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="relative">
                                <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                                    <BookOpen className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Hồ sơ kỹ năng
                                </h1>
                                <p className="text-lg text-gray-600 mt-1">
                                    Thể hiện khả năng và định hướng của bạn
                                </p>
                                {skillProfile && (
                                    <div className="flex items-center mt-3 space-x-4">
                                        <Badge
                                            variant={skillProfile.is_public ? "success" : "secondary"}
                                            className="flex items-center"
                                        >
                                            {skillProfile.is_public ? (
                                                <>
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    Công khai
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff className="w-3 h-3 mr-1" />
                                                    Riêng tư
                                                </>
                                            )}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            Cập nhật lần cuối: {format(new Date(skillProfile.last_updated), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            {!isEditing ? (
                                <>
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        variant="outline"
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Chỉnh sửa
                                    </Button>
                                    {skillProfile && (
                                        <Button
                                            onClick={() => setShowDeleteModal(true)}
                                            variant="destructive"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Xóa
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={handleSaveProfile}
                                        disabled={saving}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {saving ? (
                                            <LoadingSpinner size="sm" />
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                Lưu
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsEditing(false);
                                            loadSkillProfile();
                                        }}
                                        variant="outline"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Skills */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                                Kỹ năng hiện có
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-4">
                                    {formData.current_skills.map((skill, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                                                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                                        <span>Nguồn: {skill.source}</span>
                                                        <Badge className={getSkillLevelColor(skill.level)}>
                                                            {formatSkillLevel(skill.level)}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openSkillModal(index)}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deleteSkill(index)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => openSkillModal()}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm kỹ năng
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {skillProfile?.current_skills?.length > 0 ? (
                                        skillProfile.current_skills.map((skill, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                                                        <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                                                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                                            <span>Nguồn: {skill.source}</span>
                                                            <Badge className={getSkillLevelColor(skill.level)}>
                                                                {formatSkillLevel(skill.level)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>Chưa có kỹ năng nào được thêm</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Learning Goals */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-green-500" />
                                Mục tiêu học tập
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <div className="space-y-4">
                                    {formData.learning_goals.map((goal, index) => (
                                        <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{goal.skill}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{goal.reason}</p>
                                                    <div className="flex items-center mt-2 text-sm text-gray-500">
                                                        <Calendar className="w-3 h-3 mr-1" />
                                                        {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: vi })}
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 ml-4">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => openGoalModal(index)}
                                                    >
                                                        <Edit className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => deleteGoal(index)}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        onClick={() => openGoalModal()}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Thêm mục tiêu
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {skillProfile?.learning_goals?.length > 0 ? (
                                        skillProfile.learning_goals.map((goal, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                <h4 className="font-semibold text-gray-900">{goal.skill}</h4>
                                                <p className="text-sm text-gray-600 mt-1">{goal.reason}</p>
                                                <div className="flex items-center mt-2 text-sm text-gray-500">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {format(new Date(goal.target_date), 'dd/MM/yyyy', { locale: vi })}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>Chưa có mục tiêu nào</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Interested Fields */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Briefcase className="w-5 h-5 mr-2 text-purple-500" />
                        Lĩnh vực quan tâm
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isEditing ? (
                        <div className="space-y-4">
                            {formData.interested_fields.map((field, index) => (
                                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{field.reason}</p>
                                        </div>
                                        <div className="flex space-x-2 ml-4">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openFieldModal(index)}
                                            >
                                                <Edit className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deleteField(index)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <Button
                                onClick={() => openFieldModal()}
                                variant="outline"
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Thêm lĩnh vực
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {skillProfile?.interested_fields?.length > 0 ? (
                                skillProfile.interested_fields.map((field, index) => (
                                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                        <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{field.reason}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>Chưa có lĩnh vực nào được thêm</p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary */}
            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-500" />
                            Tóm tắt về bản thân
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Viết một đoạn tóm tắt về bản thân, định hướng nghề nghiệp và mục tiêu của bạn..."
                            value={formData.summary}
                            onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                            rows={4}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Summary Display */}
            {!isEditing && skillProfile?.summary && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-indigo-500" />
                            Tóm tắt về bản thân
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">{skillProfile.summary}</p>
                    </CardContent>
                </Card>
            )}

            {/* Privacy Settings */}
            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Eye className="w-5 h-5 mr-2 text-gray-500" />
                            Cài đặt quyền riêng tư
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-4">
                            <input
                                type="checkbox"
                                id="is_public"
                                checked={formData.is_public}
                                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 rounded"
                            />
                            <label htmlFor="is_public" className="text-sm text-gray-700">
                                Cho phép công ty xem hồ sơ kỹ năng của tôi
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Khi bật, các công ty có thể tìm kiếm và xem hồ sơ kỹ năng của bạn
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Modals */}
            {/* Skill Modal */}
            <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)}>
                <ModalHeader>
                    <ModalTitle>
                        {editingIndex >= 0 ? 'Chỉnh sửa kỹ năng' : 'Thêm kỹ năng mới'}
                    </ModalTitle>
                </ModalHeader>
                <div className="p-6 space-y-4">
                    {errors.skill && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            {errors.skill.map((error, index) => (
                                <div key={index} className="flex items-center text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên kỹ năng *
                        </label>
                        <Input
                            value={skillForm.name}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ví dụ: JavaScript, React, Python..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả kỹ năng *
                        </label>
                        <Textarea
                            value={skillForm.description}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Mô tả chi tiết về kỹ năng này..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nguồn học tập *
                        </label>
                        <Input
                            value={skillForm.source}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, source: e.target.value }))}
                            placeholder="Ví dụ: Trường đại học, tự học, khóa học online..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mức độ *
                        </label>
                        <Select
                            value={skillForm.level}
                            onChange={(e) => setSkillForm(prev => ({ ...prev, level: e.target.value }))}
                        >
                            <option value="basic">Cơ bản</option>
                            <option value="intermediate">Trung bình</option>
                            <option value="advanced">Thành thạo</option>
                        </Select>
                    </div>
                </div>
                <ModalFooter>
                    <Button
                        onClick={() => setShowSkillModal(false)}
                        variant="outline"
                    >
                        Hủy
                    </Button>
                    <Button onClick={saveSkill}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Lưu
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Goal Modal */}
            <Modal isOpen={showGoalModal} onClose={() => setShowGoalModal(false)}>
                <ModalHeader>
                    <ModalTitle>
                        {editingIndex >= 0 ? 'Chỉnh sửa mục tiêu' : 'Thêm mục tiêu mới'}
                    </ModalTitle>
                </ModalHeader>
                <div className="p-6 space-y-4">
                    {errors.goal && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            {errors.goal.map((error, index) => (
                                <div key={index} className="flex items-center text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kỹ năng muốn học *
                        </label>
                        <Input
                            value={goalForm.skill}
                            onChange={(e) => setGoalForm(prev => ({ ...prev, skill: e.target.value }))}
                            placeholder="Ví dụ: Machine Learning, DevOps, UI/UX Design..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do học tập *
                        </label>
                        <Textarea
                            value={goalForm.reason}
                            onChange={(e) => setGoalForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Giải thích tại sao bạn muốn học kỹ năng này..."
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mục tiêu thời gian *
                        </label>
                        <Input
                            type="date"
                            value={goalForm.target_date}
                            onChange={(e) => setGoalForm(prev => ({ ...prev, target_date: e.target.value }))}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>
                <ModalFooter>
                    <Button
                        onClick={() => setShowGoalModal(false)}
                        variant="outline"
                    >
                        Hủy
                    </Button>
                    <Button onClick={saveGoal}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Lưu
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Field Modal */}
            <Modal isOpen={showFieldModal} onClose={() => setShowFieldModal(false)}>
                <ModalHeader>
                    <ModalTitle>
                        {editingIndex >= 0 ? 'Chỉnh sửa lĩnh vực' : 'Thêm lĩnh vực mới'}
                    </ModalTitle>
                </ModalHeader>
                <div className="p-6 space-y-4">
                    {errors.field && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            {errors.field.map((error, index) => (
                                <div key={index} className="flex items-center text-red-600 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên lĩnh vực *
                        </label>
                        <Input
                            value={fieldForm.name}
                            onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ví dụ: Phát triển web, AI/ML, Marketing..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lý do quan tâm *
                        </label>
                        <Textarea
                            value={fieldForm.reason}
                            onChange={(e) => setFieldForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Giải thích tại sao bạn quan tâm đến lĩnh vực này..."
                            rows={3}
                        />
                    </div>
                </div>
                <ModalFooter>
                    <Button
                        onClick={() => setShowFieldModal(false)}
                        variant="outline"
                    >
                        Hủy
                    </Button>
                    <Button onClick={saveField}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Lưu
                    </Button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
                <ModalHeader>
                    <ModalTitle>Xác nhận xóa</ModalTitle>
                </ModalHeader>
                <div className="p-6">
                    <p className="text-gray-700">
                        Bạn có chắc chắn muốn xóa hồ sơ kỹ năng? Hành động này không thể hoàn tác.
                    </p>
                </div>
                <ModalFooter>
                    <Button
                        onClick={() => setShowDeleteModal(false)}
                        variant="outline"
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDeleteProfile}
                        variant="destructive"
                        disabled={saving}
                    >
                        {saving ? (
                            <LoadingSpinner size="sm" />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Xóa
                            </>
                        )}
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default SkillProfile; 