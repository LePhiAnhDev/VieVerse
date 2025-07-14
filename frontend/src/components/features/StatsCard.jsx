import React from 'react';
import { cn } from '../../utils/helpers';

const StatsCard = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    change,
    changeType = 'neutral',
    gradient = false,
    className
}) => {
    const getTrendColor = (trend) => {
        if (trend > 0) return 'text-green-600';
        if (trend < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeColor = (type) => {
        switch (type) {
            case 'positive':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'negative':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className={cn(
            'relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md hover:border-blue-200',
            gradient && 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200',
            className
        )}>
            {/* Background decoration */}
            {gradient && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
            )}

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className={cn(
                        'p-3 rounded-xl transition-colors duration-200',
                        gradient ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    )}>
                        <Icon className="h-6 w-6" />
                    </div>
                    {trend !== undefined && (
                        <div className={cn(
                            'flex items-center space-x-1 text-sm font-medium',
                            getTrendColor(trend)
                        )}>
                            <span>{trend > 0 ? '+' : ''}{trend}%</span>
                            <svg
                                className={cn(
                                    'h-4 w-4',
                                    trend > 0 ? 'rotate-0' : 'rotate-180'
                                )}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-600">
                        {title}
                    </h3>
                    <div className="flex items-baseline space-x-2">
                        <p className={cn(
                            'text-3xl font-bold',
                            gradient ? 'text-blue-600' : 'text-gray-900'
                        )}>
                            {value}
                        </p>
                        {change && (
                            <span className={cn(
                                'px-2 py-1 text-xs font-medium rounded-full border',
                                getChangeColor(changeType)
                            )}>
                                {change}
                            </span>
                        )}
                    </div>
                    {description && (
                        <p className="text-sm text-gray-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;