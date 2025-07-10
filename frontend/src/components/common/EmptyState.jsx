import React from 'react';
import { cn } from '../../utils/helpers';
import Button from '../ui/Button';

const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    onAction,
    className
}) => {
    return (
        <div className={cn(
            'flex flex-col items-center justify-center py-12 px-4 text-center',
            className
        )}>
            {Icon && (
                <div className="mb-4 p-3 bg-gray-100 rounded-full">
                    <Icon className="h-8 w-8 text-gray-400" />
                </div>
            )}

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-600 mb-6 max-w-md">
                    {description}
                </p>
            )}

            {action && onAction && actionLabel && (
                <Button onClick={onAction}>
                    {actionLabel}
                </Button>
            )}

            {action && !onAction && action}
        </div>
    );
};

export default EmptyState;