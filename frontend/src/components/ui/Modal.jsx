import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/helpers';
import Button from './Button';

const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'default',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]'
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative w-full bg-white rounded-2xl shadow-2xl transform transition-all animate-scale-in mx-4',
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div>
                            {title && (
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-gray-600">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className={cn(
                    'p-6',
                    !(title || showCloseButton) && 'relative'
                )}>
                    {!(title || showCloseButton) && showCloseButton && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

// Modal components for composition
const ModalHeader = ({ className, children, ...props }) => (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props}>
        {children}
    </div>
);

const ModalTitle = ({ className, children, ...props }) => (
    <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
        {children}
    </h2>
);

const ModalDescription = ({ className, children, ...props }) => (
    <p className={cn('text-sm text-gray-600', className)} {...props}>
        {children}
    </p>
);

const ModalFooter = ({ className, children, ...props }) => (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2', className)} {...props}>
        {children}
    </div>
);

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter };
export default Modal;