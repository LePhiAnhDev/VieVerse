import React from 'react';
import { cn } from '../../utils/helpers';
import { ChevronDown } from 'lucide-react';

const Select = React.forwardRef(({
    className,
    children,
    error,
    ...props
}, ref) => {
    return (
        <div className="relative">
            <select
                className={cn(
                    'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                    'transition-colors duration-200',
                    'appearance-none pr-10',
                    error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>

            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown className="h-4 w-4" />
            </div>
        </div>
    );
});

Select.displayName = 'Select';

export default Select;