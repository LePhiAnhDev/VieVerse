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
                'flex min-h-[80px] w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm',
                'placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                'transition-colors duration-200',
                'resize-vertical',
                error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
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