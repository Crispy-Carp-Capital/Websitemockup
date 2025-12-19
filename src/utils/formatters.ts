import { format, formatDistanceToNow, formatDuration, intervalToDuration } from 'date-fns';

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(value: number, decimals = 2): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? '-' : value > 0 ? '+' : '';

    if (absValue >= 1000000) {
        return `${sign}$${(absValue / 1000000).toFixed(2)}M`;
    }
    if (absValue >= 1000) {
        return `${sign}$${(absValue / 1000).toFixed(2)}K`;
    }
    return `${sign}$${absValue.toFixed(decimals)}`;
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number, decimals = 2, showSign = true): string {
    const sign = showSign ? (value > 0 ? '+' : '') : '';
    return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format a large number with K/M suffixes
 */
export function formatNumber(value: number, decimals = 1): string {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(decimals)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(decimals)}K`;
    }
    return value.toFixed(decimals);
}

/**
 * Format seconds into human-readable duration
 */
export function formatSeconds(seconds: number): string {
    const duration = intervalToDuration({ start: 0, end: seconds * 1000 });

    if (duration.hours && duration.hours > 0) {
        return formatDuration(duration, { format: ['hours', 'minutes'] });
    }
    if (duration.minutes && duration.minutes > 0) {
        return formatDuration(duration, { format: ['minutes', 'seconds'] });
    }
    return formatDuration(duration, { format: ['seconds'] });
}

/**
 * Format seconds into short duration (e.g., "2h 15m")
 */
export function formatDurationShort(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
}

/**
 * Format a date string or timestamp
 */
export function formatDate(date: string | number | Date, formatStr = 'MMM d, yyyy'): string {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return format(d, formatStr);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | number | Date): string {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format timestamp for logs (e.g., "14:32:15")
 */
export function formatLogTime(timestamp: number): string {
    return format(new Date(timestamp), 'HH:mm:ss');
}

/**
 * Format a price value
 */
export function formatPrice(value: number, symbol = '$'): string {
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format scientific notation numbers (e.g., learning rate)
 */
export function formatScientific(value: number): string {
    if (value >= 0.01) {
        return value.toFixed(4);
    }
    return value.toExponential(1);
}

/**
 * Format a ratio (e.g., Sharpe ratio)
 */
export function formatRatio(value: number): string {
    return value.toFixed(2);
}

/**
 * Format minutes into hours and minutes
 */
export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

/**
 * Get color class based on value (positive/negative)
 */
export function getValueColorClass(value: number): string {
    if (value > 0) return 'text-success-500';
    if (value < 0) return 'text-error-500';
    return 'text-dark-500';
}

/**
 * Get background color class based on value
 */
export function getValueBgClass(value: number): string {
    if (value > 0) return 'bg-success-500/10';
    if (value < 0) return 'bg-error-500/10';
    return 'bg-dark-500/10';
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
    if (bytes >= 1073741824) {
        return `${(bytes / 1073741824).toFixed(1)} GB`;
    }
    if (bytes >= 1048576) {
        return `${(bytes / 1048576).toFixed(1)} MB`;
    }
    if (bytes >= 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} B`;
}

/**
 * Calculate estimated training time based on timesteps
 */
export function estimateTrainingTime(totalTimesteps: number, stepsPerSecond = 1500): string {
    const seconds = totalTimesteps / stepsPerSecond;
    const hours = Math.ceil(seconds / 3600);

    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `~${days}d ${hours % 24}h`;
    }
    return `~${hours}h`;
}

/**
 * Calculate approximate date range from timesteps
 */
export function timestepsToDateRange(timesteps: number, timeframeMinutes = 1): string {
    const totalMinutes = timesteps * timeframeMinutes;
    const days = Math.floor(totalMinutes / 1440);
    const months = Math.floor(days / 30);

    if (months >= 12) {
        const years = Math.floor(months / 12);
        return `≈ ${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        return `≈ ${months} month${months > 1 ? 's' : ''}`;
    }
    return `≈ ${days} day${days > 1 ? 's' : ''}`;
}
