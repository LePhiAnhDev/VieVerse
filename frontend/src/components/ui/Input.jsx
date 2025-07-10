import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({
    className,
    type = 'text',
    error,
    icon: Icon,
    iconPosition = 'left',
    ...props
}, ref) => {
    return (
        <div className="relative">
            {Icon && iconPosition === 'left' && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icon className="h-4 w-4" />
                </div>
            )}

            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                    'placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                    'transition-colors duration-200',
                    Icon && iconPosition === 'left' && 'pl-10',
                    Icon && iconPosition === 'right' && 'pr-10',
                    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />

            {Icon && iconPosition === 'right' && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icon className="h-4 w-4" />
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;