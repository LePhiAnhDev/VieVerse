export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    TASKS: '/tasks',
    TASK_DETAIL: '/tasks/:id',
    PROFILE: '/profile',
    TOKENS: '/tokens'
};

export const USER_ROLES = {
    STUDENT: 'student',
    COMPANY: 'company'
};

export const TASK_STATUS = {
    OPEN: 'open',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const TASK_DIFFICULTY = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
};

export const APPLICATION_STATUS = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
};

export const STATUS_LABELS = {
    [TASK_STATUS.OPEN]: 'Đang mở',
    [TASK_STATUS.IN_PROGRESS]: 'Đang thực hiện',
    [TASK_STATUS.COMPLETED]: 'Hoàn thành',
    [TASK_STATUS.CANCELLED]: 'Đã hủy'
};

export const DIFFICULTY_LABELS = {
    [TASK_DIFFICULTY.BEGINNER]: 'Người mới',
    [TASK_DIFFICULTY.INTERMEDIATE]: 'Trung bình',
    [TASK_DIFFICULTY.ADVANCED]: 'Nâng cao'
};

export const APPLICATION_STATUS_LABELS = {
    [APPLICATION_STATUS.PENDING]: 'Đang chờ duyệt',
    [APPLICATION_STATUS.ACCEPTED]: 'Đã chấp nhận',
    [APPLICATION_STATUS.REJECTED]: 'Bị từ chối'
};

export const STATUS_COLORS = {
    [TASK_STATUS.OPEN]: 'bg-purple-50 text-purple-700 border-purple-200',
    [TASK_STATUS.IN_PROGRESS]: 'bg-amber-50 text-amber-700 border-amber-200',
    [TASK_STATUS.COMPLETED]: 'bg-teal-50 text-teal-700 border-teal-200',
    [TASK_STATUS.CANCELLED]: 'bg-red-50 text-red-700 border-red-200'
};

export const DIFFICULTY_COLORS = {
    [TASK_DIFFICULTY.BEGINNER]: 'bg-teal-50 text-teal-700 border-teal-200',
    [TASK_DIFFICULTY.INTERMEDIATE]: 'bg-amber-50 text-amber-700 border-amber-200',
    [TASK_DIFFICULTY.ADVANCED]: 'bg-red-50 text-red-700 border-red-200'
};

export const APPLICATION_STATUS_COLORS = {
    [APPLICATION_STATUS.PENDING]: 'bg-amber-50 text-amber-700 border-amber-200',
    [APPLICATION_STATUS.ACCEPTED]: 'bg-teal-50 text-teal-700 border-teal-200',
    [APPLICATION_STATUS.REJECTED]: 'bg-red-50 text-red-700 border-red-200'
};

export const SORT_OPTIONS = [
    { value: 'created_at_DESC', label: 'Mới nhất' },
    { value: 'created_at_ASC', label: 'Cũ nhất' },
    { value: 'deadline_ASC', label: 'Deadline gần nhất' },
    { value: 'reward_tokens_DESC', label: 'Token cao nhất' },
    { value: 'reward_tokens_ASC', label: 'Token thấp nhất' }
];

export const ITEMS_PER_PAGE = 12;

export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500
};