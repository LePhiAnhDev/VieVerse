import React from 'react';
import { Link } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Coins,
    Users,
    Clock,
    CheckCircle,
    Building
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import {
    STATUS_LABELS,
    DIFFICULTY_LABELS,
    STATUS_COLORS,
    DIFFICULTY_COLORS
} from '../../utils/constants';
import {
    cn,
    isDeadlineSoon,
    isDeadlinePassed,
    getAvatarUrl,
    truncateText
} from '../../utils/helpers';
import { formatDate } from '../../utils/formatters';

const TaskCard = ({ task, showApplyButton = true, className }) => {
    const deadlineSoon = isDeadlineSoon(task.deadline);
    const deadlinePassed = isDeadlinePassed(task.deadline);
    const canApply = task.status === 'open' && !deadlinePassed &&
        task.current_applicants < task.max_applicants;

    return (
        <Card
            className={cn(
                'group overflow-hidden transition-all duration-200 hover:shadow-md',
                'border-gray-200 hover:border-blue-200',
                className
            )}
        >
            <CardHeader className="pb-4">
                {/* Company info */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <img
                            src={getAvatarUrl(task.company?.company_name || task.company?.name)}
                            alt={task.company?.company_name || task.company?.name}
                            className="h-8 w-8 rounded-full border-2 border-gray-200 group-hover:border-blue-200 transition-colors duration-200"
                        />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {task.company?.company_name || task.company?.name}
                            </p>
                            {task.company?.is_verified && (
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="h-3 w-3 text-blue-500" />
                                    <span className="text-xs text-blue-600">Đã xác minh</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Badge
                            variant={task.status === 'open' ? 'primary' :
                                task.status === 'completed' ? 'success' : 'warning'}
                            size="sm"
                        >
                            {STATUS_LABELS[task.status]}
                        </Badge>
                    </div>
                </div>

                {/* Task title */}
                <Link
                    to={`/tasks/${task.id}`}
                    className="block group-hover:text-blue-600 transition-colors duration-200"
                >
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-tight">
                        {task.title}
                    </h3>
                </Link>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {truncateText(task.description, 120)}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                    {task.skills_required?.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" size="sm">
                            {skill}
                        </Badge>
                    ))}
                    {task.skills_required?.length > 3 && (
                        <Badge variant="secondary" size="sm">
                            +{task.skills_required.length - 3}
                        </Badge>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors duration-200">
                            <Coins className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {task.reward_tokens}
                            </p>
                            <p className="text-xs text-gray-500">Token</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {task.current_applicants}/{task.max_applicants}
                            </p>
                            <p className="text-xs text-gray-500">Ứng viên</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className={cn(
                            'p-1.5 rounded-lg transition-colors duration-200',
                            deadlinePassed ? 'bg-red-50 group-hover:bg-red-100' :
                                deadlineSoon ? 'bg-orange-50 group-hover:bg-orange-100' :
                                    'bg-gray-50 group-hover:bg-gray-100'
                        )}>
                            <Calendar className={cn(
                                'h-4 w-4',
                                deadlinePassed ? 'text-red-600' : deadlineSoon ? 'text-orange-600' : 'text-gray-600'
                            )} />
                        </div>
                        <div>
                            <p className={cn(
                                'text-sm font-semibold',
                                deadlinePassed ? 'text-red-600' : deadlineSoon ? 'text-orange-600' : 'text-gray-900'
                            )}>
                                {formatDate(task.deadline)}
                            </p>
                            <p className="text-xs text-gray-500">Deadline</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors duration-200">
                            <MapPin className="h-4 w-4 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {task.is_remote ? 'Remote' : 'Tại chỗ'}
                            </p>
                            <p className="text-xs text-gray-500">Địa điểm</p>
                        </div>
                    </div>
                </div>

                {/* Difficulty */}
                <div className="flex items-center justify-between">
                    <Badge
                        variant={task.difficulty === 'beginner' ? 'success' :
                            task.difficulty === 'intermediate' ? 'warning' : 'danger'}
                        size="sm"
                    >
                        {DIFFICULTY_LABELS[task.difficulty]}
                    </Badge>

                    {deadlineSoon && (
                        <div className="flex items-center space-x-1 text-orange-600">
                            <Clock className="h-3 w-3" />
                            <span className="text-xs font-medium">Sắp hết hạn</span>
                        </div>
                    )}
                </div>

                {/* Action button */}
                {showApplyButton && canApply && (
                    <Link to={`/tasks/${task.id}`} className="block">
                        <Button
                            className="w-full transition-all duration-200"
                            variant="gradient"
                        >
                            Xem chi tiết & Ứng tuyển
                        </Button>
                    </Link>
                )}

                {showApplyButton && !canApply && task.status === 'open' && (
                    <Button
                        disabled
                        className="w-full"
                        variant="outline"
                    >
                        {deadlinePassed ? 'Đã hết hạn' :
                            task.current_applicants >= task.max_applicants ? 'Đã đủ ứng viên' : 'Không thể ứng tuyển'}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default TaskCard;