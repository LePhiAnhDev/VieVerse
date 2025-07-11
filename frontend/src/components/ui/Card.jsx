import React from 'react';
import { cn } from '../../utils/helpers';

const Card = React.forwardRef(({
    className,
    children,
    hover = false,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'rounded-2xl border border-gray-200 bg-white shadow-sm',
                hover && 'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-purple-200',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';

const CardHeader = React.forwardRef(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <h3
            ref={ref}
            className={cn('text-lg font-semibold leading-none tracking-tight text-gray-900', className)}
            {...props}
        >
            {children}
        </h3>
    );
});

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <p
            ref={ref}
            className={cn('text-sm text-gray-600', className)}
            {...props}
        >
            {children}
        </p>
    );
});

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn('p-6 pt-2', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({
    className,
    children,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn('flex items-center p-6 pt-2', className)}
            {...props}
        >
            {children}
        </div>
    );
});

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };