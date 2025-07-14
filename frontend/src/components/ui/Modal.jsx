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
        sm: 'max-w-md w-full mx-4',
        default: 'max-w-lg w-full mx-4',
        lg: 'max-w-2xl w-full mx-4',
        xl: 'max-w-4xl w-full mx-4',
        full: 'max-w-[95vw] w-[95vw] max-h-[95vh]'
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-start justify-center animate-fade-in p-4 pt-16">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={cn(
                    'relative bg-white rounded-2xl shadow-2xl transform transition-all animate-scale-in',
                    'max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col',
                    sizeClasses[size],
                    className
                )}
            >
                {/* Header - Fixed */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 flex-shrink-0 bg-white">
                        <div className="flex-1 min-w-0">
                            {title && (
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                    {description}
                                </p>
                            )}
                        </div>
                        {showCloseButton && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="flex-shrink-0 ml-3"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Content - Scrollable */}
                <div className={cn(
                    'flex-1 overflow-y-auto modal-scroll',
                    !(title || showCloseButton) && 'relative'
                )}>
                    <div className="p-4 sm:p-6">
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