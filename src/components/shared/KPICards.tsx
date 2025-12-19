import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { formatCurrency, formatPercent, formatRatio, getValueColorClass } from '../../utils/formatters';

// KPI Card Component
interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    change?: number;
    changeLabel?: string;
    icon?: LucideIcon;
    format?: 'currency' | 'percent' | 'ratio' | 'number';
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

export function KPICard({
    title,
    value,
    subtitle,
    change,
    changeLabel,
    icon: Icon,
    format = 'number',
    variant = 'default',
    size = 'md',
}: KPICardProps) {
    const formattedValue = React.useMemo(() => {
        if (typeof value === 'string') return value;
        switch (format) {
            case 'currency':
                return formatCurrency(value);
            case 'percent':
                return formatPercent(value);
            case 'ratio':
                return formatRatio(value);
            default:
                return value.toLocaleString();
        }
    }, [value, format]);

    const variantClasses = {
        default: 'bg-white dark:bg-dark-800 border-dark-200 dark:border-dark-700',
        success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
        warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
        error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800',
    };

    const sizeClasses = {
        sm: 'p-3',
        md: 'p-4',
        lg: 'p-6',
    };

    const TrendIcon = change !== undefined
        ? change > 0
            ? TrendingUp
            : change < 0
                ? TrendingDown
                : Minus
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border ${variantClasses[variant]} ${sizeClasses[size]}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-dark-500 dark:text-dark-400">{title}</p>
                    <p className={`font-bold text-dark-900 dark:text-dark-100 ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'
                        }`}>
                        {formattedValue}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-dark-500 mt-1">{subtitle}</p>
                    )}
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${getValueColorClass(change)}`}>
                            {TrendIcon && <TrendIcon className="w-4 h-4" />}
                            <span>{formatPercent(change)}</span>
                            {changeLabel && (
                                <span className="text-dark-400 ml-1">{changeLabel}</span>
                            )}
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-2 rounded-lg ${variant === 'success'
                            ? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
                            : variant === 'warning'
                                ? 'bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400'
                                : variant === 'error'
                                    ? 'bg-error-100 dark:bg-error-900/30 text-error-600 dark:text-error-400'
                                    : 'bg-dark-100 dark:bg-dark-700 text-dark-600 dark:text-dark-400'
                        }`}>
                        <Icon className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// Stats Row Component
interface StatItem {
    label: string;
    value: string | number;
    format?: 'currency' | 'percent' | 'ratio' | 'number';
}

interface StatsRowProps {
    stats: StatItem[];
    className?: string;
}

export function StatsRow({ stats, className = '' }: StatsRowProps) {
    return (
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-dark-800 rounded-lg border border-dark-200 dark:border-dark-700 p-4"
                >
                    <p className="text-sm text-dark-500 dark:text-dark-400">{stat.label}</p>
                    <p className="text-xl font-bold text-dark-900 dark:text-dark-100 mt-1">
                        {typeof stat.value === 'number'
                            ? stat.format === 'currency'
                                ? formatCurrency(stat.value)
                                : stat.format === 'percent'
                                    ? formatPercent(stat.value)
                                    : stat.format === 'ratio'
                                        ? formatRatio(stat.value)
                                        : stat.value.toLocaleString()
                            : stat.value}
                    </p>
                </div>
            ))}
        </div>
    );
}

// Metric Card Grid
interface MetricCardProps {
    label: string;
    value: string | number;
    subValue?: string;
    colorClass?: string;
}

interface MetricCardGridProps {
    metrics: MetricCardProps[];
    columns?: 2 | 3 | 4;
    className?: string;
}

export function MetricCardGrid({ metrics, columns = 3, className = '' }: MetricCardGridProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-3 ${className}`}>
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center"
                >
                    <p className="text-xs text-dark-500 mb-1">{metric.label}</p>
                    <p className={`text-lg font-bold ${metric.colorClass || 'text-dark-900 dark:text-dark-100'}`}>
                        {metric.value}
                    </p>
                    {metric.subValue && (
                        <p className="text-xs text-dark-400 mt-0.5">{metric.subValue}</p>
                    )}
                </div>
            ))}
        </div>
    );
}

// Status Badge
interface StatusBadgeProps {
    status: 'success' | 'warning' | 'error' | 'info' | 'training' | 'completed' | 'failed' | 'deployed' | 'draft';
    label?: string;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
    const statusConfig = {
        success: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-400', icon: '✓' },
        warning: { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning-700 dark:text-warning-400', icon: '⚠' },
        error: { bg: 'bg-error-100 dark:bg-error-900/30', text: 'text-error-700 dark:text-error-400', icon: '✗' },
        info: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-700 dark:text-primary-400', icon: 'ℹ' },
        training: { bg: 'bg-warning-100 dark:bg-warning-900/30', text: 'text-warning-700 dark:text-warning-400', icon: '⏳' },
        completed: { bg: 'bg-success-100 dark:bg-success-900/30', text: 'text-success-700 dark:text-success-400', icon: '✓' },
        failed: { bg: 'bg-error-100 dark:bg-error-900/30', text: 'text-error-700 dark:text-error-400', icon: '✗' },
        deployed: { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-700 dark:text-primary-400', icon: '🚀' },
        draft: { bg: 'bg-dark-100 dark:bg-dark-700', text: 'text-dark-600 dark:text-dark-400', icon: '📝' },
    };

    const config = statusConfig[status];
    const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
    const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.text} ${sizeClasses}`}>
            <span>{config.icon}</span>
            <span>{displayLabel}</span>
        </span>
    );
}

// Comparison Table Row
interface ComparisonRowProps {
    name: string;
    values: Array<{
        value: string | number;
        format?: 'currency' | 'percent' | 'ratio';
    }>;
    isBest?: boolean;
    isWorst?: boolean;
}

interface ComparisonTableProps {
    headers: string[];
    rows: ComparisonRowProps[];
    className?: string;
}

export function ComparisonTable({ headers, rows, className = '' }: ComparisonTableProps) {
    return (
        <div className={`overflow-x-auto ${className}`}>
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-dark-200 dark:border-dark-700">
                        {headers.map((header, index) => (
                            <th
                                key={index}
                                className="text-left py-3 px-4 font-medium text-dark-500 dark:text-dark-400"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className={`border-b border-dark-100 dark:border-dark-800 ${row.isBest
                                    ? 'bg-success-50 dark:bg-success-900/10'
                                    : row.isWorst
                                        ? 'bg-error-50 dark:bg-error-900/10'
                                        : ''
                                }`}
                        >
                            <td className="py-3 px-4 font-medium text-dark-900 dark:text-dark-100">
                                {row.name}
                                {row.isBest && (
                                    <span className="ml-2 text-xs text-success-600 dark:text-success-400">BEST</span>
                                )}
                                {row.isWorst && (
                                    <span className="ml-2 text-xs text-error-600 dark:text-error-400">WORST</span>
                                )}
                            </td>
                            {row.values.map((val, valIndex) => (
                                <td key={valIndex} className="py-3 px-4 font-mono text-dark-700 dark:text-dark-300">
                                    {typeof val.value === 'number'
                                        ? val.format === 'currency'
                                            ? formatCurrency(val.value)
                                            : val.format === 'percent'
                                                ? formatPercent(val.value)
                                                : val.format === 'ratio'
                                                    ? formatRatio(val.value)
                                                    : val.value.toLocaleString()
                                        : val.value}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
