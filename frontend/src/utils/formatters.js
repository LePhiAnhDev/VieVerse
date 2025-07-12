import { format, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date to Vietnamese format
 */
export function formatDate(date, pattern = 'dd/MM/yyyy') {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }
        return format(dateObj, pattern, { locale: vi });
    } catch (error) {
        console.error('Error formatting date:', error, date);
        return 'N/A';
    }
}

/**
 * Format date and time
 */
export function formatDateTime(date) {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }
        return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch (error) {
        console.error('Error formatting date time:', error, date);
        return 'N/A';
    }
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date) {
    if (!date) return 'N/A';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
            return 'N/A';
        }
        return formatDistanceToNow(dateObj, {
            addSuffix: true,
            locale: vi
        });
    } catch (error) {
        console.error('Error formatting relative time:', error, date);
        return 'N/A';
    }
}

/**
 * Format number with thousand separators
 */
export function formatNumber(number) {
    return new Intl.NumberFormat('vi-VN').format(number);
}

/**
 * Format currency (VND)
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format tokens
 */
export function formatTokens(tokens) {
    if (tokens >= 1000000) {
        return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
        return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as Vietnamese phone number
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }

    return phone;
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} phút`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
        return `${hours} giờ`;
    }

    return `${hours} giờ ${remainingMinutes} phút`;
}

/**
 * Format text to title case
 */
export function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

/**
 * Format text to slug
 */
export function toSlug(str) {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}