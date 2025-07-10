import React from 'react';
import { cn } from '../../utils/helpers';

const badgeVariants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    secondary: 'bg-gray-50 text-gray-600 border-gray-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
};

const badgeSizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base'
};

const Badge = React.forwardRef(({
    className,
    variant = 'default',
    size = 'default',
    children,
    ...props
}, ref) => {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border font-medium transition-colors',
                badgeVariants[variant],
                badgeSizes[size],
                className
            )}
            ref={ref}
            {...props}
        >
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

export default Badge;