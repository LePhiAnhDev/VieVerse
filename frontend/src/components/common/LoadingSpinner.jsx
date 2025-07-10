import React from 'react';
import { cn } from '../../utils/helpers';

const LoadingSpinner = ({
    size = 'default',
    className,
    text,
    fullScreen = false
}) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        default: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const spinner = (
        <div className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
            sizeClasses[size],
            className
        )} />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="text-center">
                    {spinner}
                    {text && (
                        <p className="mt-4 text-sm text-gray-600">{text}</p>
                    )}
                </div>
            </div>
        );
    }

    if (text) {
        return (
            <div className="flex items-center justify-center space-x-3">
                {spinner}
                <span className="text-sm text-gray-600">{text}</span>
            </div>
        );
    }

    return spinner;
};

export default LoadingSpinner;