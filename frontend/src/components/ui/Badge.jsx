import React from 'react';
import { cn } from '../../utils/helpers';

const badgeVariants = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-green-50 text-green-700 border-green-200',
    secondary: 'bg-gray-50 text-gray-600 border-gray-200',
    success: 'bg-teal-50 text-teal-700 border-teal-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    purple: 'bg-green-50 text-green-700 border-green-200' // Changed from purple to green
};

const badgeSizes = {
    sm: 'px-2.5 py-1 text-xs', // Increased padding
    default: 'px-3.5 py-1.5 text-sm', // Increased padding
    lg: 'px-4.5 py-2 text-base' // Increased padding
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