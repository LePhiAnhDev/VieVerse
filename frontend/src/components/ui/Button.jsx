import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-colors duration-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400',
    secondary: 'bg-blue-100 text-blue-900 hover:bg-blue-200',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    link: 'text-blue-600 underline-offset-4 hover:underline p-0 h-auto',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200',
    success: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
};

const buttonSizes = {
    sm: 'h-9 px-3 text-sm', // Increased from h-8
    default: 'h-11 px-4 py-2', // Increased from h-10
    lg: 'h-13 px-6 text-lg', // Increased from h-12
    icon: 'h-11 w-11' // Increased from h-10 w-10
};

const Button = React.forwardRef(({
    className,
    variant = 'default',
    size = 'default',
    loading = false,
    disabled = false,
    children,
    ...props
}, ref) => {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'active:scale-95',
                buttonVariants[variant],
                buttonSizes[size],
                className
            )}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;