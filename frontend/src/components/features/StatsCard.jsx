import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils/helpers';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    change,
    changeType,
    description,
    trend,
    className,
    gradient = false
}) => {
    const getTrendIcon = () => {
        if (trend > 0) return TrendingUp;
        if (trend < 0) return TrendingDown;
        return null;
    };

    const getTrendColor = () => {
        if (trend > 0) return 'text-teal-600';
        if (trend < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const TrendIcon = getTrendIcon();

    return (
        <Card
            className={cn(
                'overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
                gradient && 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
                className
            )}
        >
            <CardContent className="p-7"> {/* Increased padding from p-6 */}
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 mb-2">
                            {value}
                        </p>
                        {description && (
                            <p className="text-sm text-gray-500">
                                {description}
                            </p>
                        )}
                        {(change !== undefined || trend !== undefined) && (
                            <div className="flex items-center mt-2 space-x-2">
                                {change !== undefined && (
                                    <span className={cn(
                                        'text-sm font-medium',
                                        changeType === 'positive' ? 'text-teal-600' :
                                            changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                                    )}>
                                        {change}
                                    </span>
                                )}
                                {TrendIcon && (
                                    <TrendIcon className={cn('h-4 w-4', getTrendColor())} />
                                )}
                                {trend !== undefined && (
                                    <span className={cn('text-sm', getTrendColor())}>
                                        {Math.abs(trend)}%
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    {Icon && (
                        <div className={cn(
                            'p-3.5 rounded-xl', /* Increased padding */
                            gradient
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                                : 'bg-green-100 text-green-600'
                        )}>
                            <Icon className="h-6 w-6" />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default StatsCard;