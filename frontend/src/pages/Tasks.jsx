import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import TaskCard from '../components/features/TaskCard';
import TaskFilters from '../components/features/TaskFilters';
import { ITEMS_PER_PAGE } from '../utils/constants';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        difficulty: '',
        status: 'open',
        category: '',
        skills: '',
        sort: 'created_at',
        order: 'DESC'
    });
    const [pagination, setPagination] = useState({
        current_page: 1,
        total_pages: 1,
        total_tasks: 0,
        per_page: ITEMS_PER_PAGE
    });

    useEffect(() => {
        fetchTasks();
    }, [filters, pagination.current_page]);

    const fetchTasks = async (page = pagination.current_page) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            params.append('page', page);
            params.append('limit', pagination.per_page);

            const response = await axios.get(`/tasks?${params}`);
            setTasks(response.data.tasks);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handlePageChange = (page) => {
        setPagination(prev => ({ ...prev, current_page: page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            difficulty: '',
            status: 'open',
            category: '',
            skills: '',
            sort: 'created_at',
            order: 'DESC'
        });
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user?.role === 'student' ? 'Khám phá nhiệm vụ' : 'Quản lý nhiệm vụ'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {user?.role === 'student'
                            ? 'Tìm kiếm những cơ hội thực tập và dự án phù hợp với bạn'
                            : 'Tạo và quản lý các nhiệm vụ để tuyển dụng tài năng trẻ'}
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="hidden md:flex items-center space-x-4 bg-white rounded-xl px-4 py-2 border border-gray-200">
                        <div className="text-center">
                            <p className="text-sm font-semibold text-gray-900">{pagination.total_tasks}</p>
                            <p className="text-xs text-gray-500">Nhiệm vụ</p>
                        </div>
                        {user?.role === 'student' && (
                            <div className="border-l border-gray-200 pl-4 text-center">
                                <p className="text-sm font-semibold text-amber-600">{user?.tokens || 0}</p>
                                <p className="text-xs text-gray-500">Token</p>
                            </div>
                        )}
                    </div>

                    {user?.role === 'company' && (
                        <Link to="/tasks/create">
                            <Button variant="gradient" className="shadow-lg">
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo nhiệm vụ mới
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters */}
            <TaskFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
            />

            {/* Results header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <p className="text-sm text-gray-600">
                        Hiển thị <span className="font-medium">{tasks.length}</span> trong tổng số{' '}
                        <span className="font-medium">{pagination.total_tasks}</span> nhiệm vụ
                    </p>
                    {pagination.total_tasks > 0 && <div className="h-4 w-px bg-gray-300" />}
                    {pagination.total_tasks > 0 && (
                        <p className="text-sm text-gray-500">
                            Trang {pagination.current_page} / {pagination.total_pages}
                        </p>
                    )}
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardHeader>
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                                    <div className="space-y-1">
                                        <div className="h-4 bg-gray-200 rounded w-24" />
                                        <div className="h-3 bg-gray-200 rounded w-16" />
                                    </div>
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-3/4" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-full" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                                <div className="flex space-x-2">
                                    <div className="h-6 bg-gray-200 rounded w-16" />
                                    <div className="h-6 bg-gray-200 rounded w-20" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="h-12 bg-gray-200 rounded" />
                                    <div className="h-12 bg-gray-200 rounded" />
                                </div>
                                <div className="h-10 bg-gray-200 rounded w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tasks grid */}
            {!loading && tasks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tasks.map((task, index) => (
                        <div
                            key={task.id}
                            className="animate-slide-up"
                            style={{
                                animationDelay: `${index * 0.1}s`,
                                animationFillMode: 'both'
                            }}
                        >
                            <TaskCard task={task} />
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!loading && tasks.length === 0 && (
                <Card className="p-12">
                    <EmptyState
                        icon={Search}
                        title="Không tìm thấy nhiệm vụ"
                        description={
                            Object.values(filters).some(value => value && value !== 'open')
                                ? 'Không có nhiệm vụ nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.'
                                : user?.role === 'student'
                                    ? 'Hiện tại chưa có nhiệm vụ nào. Hãy quay lại sau để khám phá những cơ hội mới!'
                                    : 'Bạn chưa tạo nhiệm vụ nào. Hãy tạo nhiệm vụ đầu tiên để bắt đầu tuyển dụng!'
                        }
                        action={
                            user?.role === 'company' ? (
                                <Link to="/tasks/create">
                                    <Button variant="gradient">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Tạo nhiệm vụ đầu tiên
                                    </Button>
                                </Link>
                            ) : (
                                <Button variant="outline" onClick={clearFilters}>
                                    Xóa bộ lọc
                                </Button>
                            )
                        }
                    />
                </Card>
            )}

            {/* Pagination */}
            {!loading && tasks.length > 0 && pagination.total_pages > 1 && (
                <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    totalItems={pagination.total_tasks}
                    itemsPerPage={pagination.per_page}
                    onPageChange={handlePageChange}
                />
            )}

            {/* FAB for mobile */}
            {user?.role === 'company' && (
                <Link to="/tasks/create">
                    <Button
                        variant="gradient"
                        size="icon"
                        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl md:hidden z-40"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </Link>
            )}
        </div>
    );
};

export default Tasks;
