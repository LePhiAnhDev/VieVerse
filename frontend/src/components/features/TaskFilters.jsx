import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { SORT_OPTIONS } from '../../utils/constants';

const TaskFilters = ({
    filters,
    onFilterChange,
    onClearFilters,
    className
}) => {
    const handleInputChange = (name, value) => {
        onFilterChange(name, value);
    };

    const handleSortChange = (value) => {
        const [sort, order] = value.split('_');
        onFilterChange('sort', sort);
        onFilterChange('order', order);
    };

    const hasActiveFilters = () => {
        return filters.search ||
            filters.difficulty ||
            filters.category ||
            filters.skills ||
            (filters.status && filters.status !== 'open');
    };

    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Tìm kiếm
                        </label>
                        <Input
                            type="text"
                            placeholder="Tìm kiếm nhiệm vụ..."
                            icon={Search}
                            value={filters.search}
                            onChange={(e) => handleInputChange('search', e.target.value)}
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Độ khó
                        </label>
                        <Select
                            value={filters.difficulty}
                            onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="beginner">Người mới</option>
                            <option value="intermediate">Trung bình</option>
                            <option value="advanced">Nâng cao</option>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Trạng thái
                        </label>
                        <Select
                            value={filters.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="open">Đang mở</option>
                            <option value="in_progress">Đang thực hiện</option>
                            <option value="completed">Hoàn thành</option>
                        </Select>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Sắp xếp
                        </label>
                        <Select
                            value={`${filters.sort}_${filters.order}`}
                            onChange={(e) => handleSortChange(e.target.value)}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Advanced filters */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Skills */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Kỹ năng
                        </label>
                        <Input
                            type="text"
                            placeholder="JavaScript, React, Node.js..."
                            value={filters.skills}
                            onChange={(e) => handleInputChange('skills', e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Danh mục
                        </label>
                        <Select
                            value={filters.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                            <option value="">Tất cả danh mục</option>
                            <option value="web-development">Phát triển Web</option>
                            <option value="mobile-development">Phát triển Mobile</option>
                            <option value="data-science">Khoa học dữ liệu</option>
                            <option value="design">Thiết kế</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Khác</option>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                            {hasActiveFilters() ? 'Đang áp dụng bộ lọc' : 'Không có bộ lọc nào'}
                        </span>
                    </div>

                    {hasActiveFilters() && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClearFilters}
                            className="flex items-center space-x-2"
                        >
                            <X className="h-4 w-4" />
                            <span>Xóa bộ lọc</span>
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default TaskFilters;