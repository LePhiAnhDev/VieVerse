import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * Generate avatar URL
 */
export function getAvatarUrl(name, size = 40) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&size=${size}&background=3B82F6&color=fff&format=svg`;
}

/**
 * Check if deadline is soon (within 3 days)
 */
export function isDeadlineSoon(deadline) {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(deadline) {
    return new Date(deadline) < new Date();
}

/**
 * Get greeting based on time of day
 */
export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
}

/**
 * Truncate text to specified length
 */
export function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format skills array to string
 */
export function formatSkills(skills) {
    if (!Array.isArray(skills)) return '';
    return skills.join(', ');
}

/**
 * Parse skills string to array
 */
export function parseSkills(skillsString) {
    if (!skillsString) return [];
    return skillsString
        .split(',')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current, total) {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
}

/**
 * Debounce function
 */
export function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy to clipboard:', err);
        return false;
    }
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Generate random ID
 */
export function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Sleep function for async operations
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if user can apply to task
 */
export function canUserApplyToTask(user, task, userApplication) {
    if (!user || user.role !== 'student') return false;
    if (!task || task.status !== 'open') return false;
    if (isDeadlinePassed(task.deadline)) return false;
    if (task.current_applicants >= task.max_applicants) return false;
    if (userApplication) return false;
    return true;
}