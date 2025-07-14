import React from 'react';
import { cn } from '../../utils/helpers';

const Textarea = React.forwardRef(({
    className,
    error,
    rows = 4,
    ...props
}, ref) => {
    return (
        <textarea
            className={cn(
                'flex min-h-[88px] w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm', // Updated to match Input border style
                'placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                'transition-all duration-200',
                'resize-vertical',
                error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
                className
            )}
            rows={rows}
            ref={ref}
            {...props}
        />
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;