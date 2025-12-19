import React from 'react';
import { motion } from 'framer-motion';
import { formatPercent, formatDurationShort } from '../../utils/formatters';

// Progress Bar Component
interface ProgressBarProps {
    progress: number; // 0-100
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'success' | 'warning' | 'error';
    showLabel?: boolean;
    animated?: boolean;
    className?: string;
}

export function ProgressBar({
    progress,
    size = 'md',
    variant = 'default',
    showLabel = true,
    animated = true,
    className = '',
}: ProgressBarProps) {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const variantClasses = {
        default: 'bg-primary-500',
        success: 'bg-success-500',
        warning: 'bg-warning-500',
        error: 'bg-error-500',
    };

    return (
        <div className={`space-y-1 ${className}`}>
            {showLabel && (
                <div className="flex justify-between text-sm">
                    <span className="text-dark-500 dark:text-dark-400">Progress</span>
                    <span className="font-medium text-dark-900 dark:text-dark-100">
                        {clampedProgress.toFixed(1)}%
                    </span>
                </div>
            )}
            <div className={`w-full bg-dark-200 dark:bg-dark-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <motion.div
                    initial={animated ? { width: 0 } : false}
                    animate={{ width: `${clampedProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${variantClasses[variant]}`}
                />
            </div>
        </div>
    );
}

// Training Progress Component
interface TrainingProgressProps {
    progress: number;
    elapsedTime: number;
    eta: number;
    currentStep: number;
    totalSteps: number;
    currentRollout: number;
    totalRollouts: number;
    gpuUtil: number;
    memoryUsed: number;
    memoryTotal: number;
    throughput: number;
}

export function TrainingProgress({
    progress,
    elapsedTime,
    eta,
    currentStep,
    totalSteps,
    currentRollout,
    totalRollouts,
    gpuUtil,
    memoryUsed,
    memoryTotal,
}: TrainingProgressProps) {
    return (
        <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
            <h3 className="text-sm font-medium text-dark-900 dark:text-dark-100 mb-4">
                Training Progress
            </h3>

            <ProgressBar progress={progress} size="lg" className="mb-4" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                    <p className="text-dark-500 dark:text-dark-400">Elapsed</p>
                    <p className="font-medium text-dark-900 dark:text-dark-100">
                        {formatDurationShort(elapsedTime)}
                    </p>
                </div>
                <div>
                    <p className="text-dark-500 dark:text-dark-400">ETA</p>
                    <p className="font-medium text-dark-900 dark:text-dark-100">
                        {formatDurationShort(eta)}
                    </p>
                </div>
                <div>
                    <p className="text-dark-500 dark:text-dark-400">Steps</p>
                    <p className="font-medium text-dark-900 dark:text-dark-100">
                        {currentStep.toLocaleString()} / {totalSteps.toLocaleString()}
                    </p>
                </div>
                <div>
                    <p className="text-dark-500 dark:text-dark-400">Rollouts</p>
                    <p className="font-medium text-dark-900 dark:text-dark-100">
                        {currentRollout} / {totalRollouts}
                    </p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-dark-200 dark:border-dark-700 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-dark-500 dark:text-dark-400">GPU Util</span>
                    <span className="font-medium text-dark-900 dark:text-dark-100">
                        {formatPercent(gpuUtil, 0, false)}
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-dark-500 dark:text-dark-400">Memory</span>
                    <span className="font-medium text-dark-900 dark:text-dark-100">
                        {memoryUsed.toFixed(1)} / {memoryTotal} GB
                    </span>
                </div>
            </div>
        </div>
    );
}

// Step Progress (for Wizard)
interface StepProgressProps {
    steps: Array<{
        label: string;
        completed: boolean;
        current: boolean;
    }>;
    orientation?: 'horizontal' | 'vertical';
}

export function StepProgress({ steps, orientation = 'vertical' }: StepProgressProps) {
    return (
        <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row justify-between'}`}>
            {steps.map((step, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-3 ${orientation === 'vertical' ? 'mb-4 last:mb-0' : ''}`}
                >
                    <div
                        className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step.completed
                                ? 'bg-success-500 text-white'
                                : step.current
                                    ? 'bg-primary-500 text-white ring-4 ring-primary-500/20'
                                    : 'bg-dark-200 dark:bg-dark-700 text-dark-500 dark:text-dark-400'
                            }
            `}
                    >
                        {step.completed ? '✓' : index + 1}
                    </div>
                    <span
                        className={`text-sm ${step.current
                                ? 'font-medium text-dark-900 dark:text-dark-100'
                                : step.completed
                                    ? 'text-dark-500 dark:text-dark-400'
                                    : 'text-dark-400 dark:text-dark-500'
                            }`}
                    >
                        {step.label}
                    </span>
                    {orientation === 'vertical' && index < steps.length - 1 && (
                        <div className="absolute left-4 mt-8 w-0.5 h-4 bg-dark-200 dark:bg-dark-700 -z-10" />
                    )}
                </div>
            ))}
        </div>
    );
}

// Circular Progress
interface CircularProgressProps {
    progress: number;
    size?: number;
    strokeWidth?: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
    label?: string;
}

export function CircularProgress({
    progress,
    size = 80,
    strokeWidth = 6,
    variant = 'default',
    label,
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const variantColors = {
        default: 'stroke-primary-500',
        success: 'stroke-success-500',
        warning: 'stroke-warning-500',
        error: 'stroke-error-500',
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className="stroke-dark-200 dark:stroke-dark-700"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    className={variantColors[variant]}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    strokeDasharray={circumference}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-dark-900 dark:text-dark-100">
                    {progress.toFixed(0)}%
                </span>
                {label && (
                    <span className="text-xs text-dark-500">{label}</span>
                )}
            </div>
        </div>
    );
}
