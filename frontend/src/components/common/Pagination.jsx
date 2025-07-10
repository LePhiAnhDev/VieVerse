import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/helpers';

const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    showInfo = true,
    totalItems,
    itemsPerPage,
    className
}) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
            {showInfo && totalItems && itemsPerPage && (
                <div className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">
                        {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                    </span>{' '}
                    đến{' '}
                    <span className="font-medium">
                        {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    trong tổng số{' '}
                    <span className="font-medium">{totalItems}</span> kết quả
                </div>
            )}

            <div className="flex items-center space-x-1">
                {/* Previous button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Trước</span>
                </Button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                    {visiblePages.map((page, index) => {
                        if (page === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    className="px-3 py-2 text-sm text-gray-500"
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onPageChange(page)}
                                className="min-w-[40px]"
                            >
                                {page}
                            </Button>
                        );
                    })}
                </div>

                {/* Next button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3"
                >
                    <span className="mr-1 hidden sm:inline">Sau</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

export default Pagination;