import React from 'react';
import { cn } from '../../utils/helpers';

const badgeVariants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800 border border-blue-200',
    secondary: 'bg-gray-100 text-gray-800 border border-gray-200',
    success: 'bg-teal-100 text-teal-800 border border-teal-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    outline: 'border border-gray-300 text-gray-700'
};

const badgeSizes = {
    sm: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
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
            ref={ref}
            className={cn(
                'inline-flex items-center rounded-full font-medium transition-colors duration-200',
                badgeVariants[variant],
                badgeSizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

export default Badge;