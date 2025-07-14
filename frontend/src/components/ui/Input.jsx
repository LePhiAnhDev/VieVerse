import React from 'react';
import { cn } from '../../utils/helpers';

const Input = React.forwardRef(({
    className,
    type = 'text',
    icon: Icon,
    error,
    ...props
}, ref) => {
    return (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Icon className="h-5 w-5" />
                </div>
            )}
            <input
                type={type}
                className={cn(
                    'flex h-11 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm',
                    'placeholder:text-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-all duration-200',
                    Icon && 'pl-11',
                    error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                    className
                )}
                ref={ref}
                {...props}
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;