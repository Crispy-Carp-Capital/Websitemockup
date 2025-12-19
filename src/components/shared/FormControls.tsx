import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Check, AlertCircle, Info } from 'lucide-react';

// Slider Component
interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    formatValue?: (value: number) => string;
    tooltip?: string;
    disabled?: boolean;
}

export function Slider({
    label,
    value,
    min,
    max,
    step = 0.01,
    onChange,
    formatValue,
    tooltip,
    disabled = false,
}: SliderProps) {
    const displayValue = formatValue ? formatValue(value) : value.toFixed(4);
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-dark-700 dark:text-dark-300 flex items-center gap-1">
                    {label}
                    {tooltip && (
                        <span className="cursor-help" title={tooltip}>
                            <Info className="w-3.5 h-3.5 text-dark-400" />
                        </span>
                    )}
                </label>
                <span className="text-sm font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">
                    {displayValue}
                </span>
            </div>
            <div className="relative">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    disabled={disabled}
                    className="w-full"
                />
                <div
                    className="absolute top-1/2 left-0 h-2 bg-primary-500 rounded-l-full pointer-events-none -translate-y-1/2"
                    style={{ width: `${percentage}%` }}
                />
            </div>
            <div className="flex justify-between text-xs text-dark-400">
                <span>{formatValue ? formatValue(min) : min}</span>
                <span>{formatValue ? formatValue(max) : max}</span>
            </div>
        </div>
    );
}

// Select Component
interface SelectOption {
    value: string;
    label: string;
    description?: string;
}

interface SelectProps {
    label?: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export function Select({
    label,
    value,
    options,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    className = '',
}: SelectProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                    {label}
                </label>
            )}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`
          w-full flex items-center justify-between px-3 py-2 text-left
          bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700
          rounded-lg shadow-sm transition-all duration-150
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'}
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
        `}
            >
                <span className={selectedOption ? 'text-dark-900 dark:text-dark-100' : 'text-dark-400'}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg max-h-60 overflow-auto"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`
                w-full flex items-center justify-between px-3 py-2 text-left
                hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors
                ${option.value === value ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
              `}
                        >
                            <div>
                                <div className="text-sm text-dark-900 dark:text-dark-100">{option.label}</div>
                                {option.description && (
                                    <div className="text-xs text-dark-500">{option.description}</div>
                                )}
                            </div>
                            {option.value === value && <Check className="w-4 h-4 text-primary-500" />}
                        </button>
                    ))}
                </motion.div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
}

// Input Component
interface InputProps {
    label?: string;
    value: string | number;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'email' | 'password';
    placeholder?: string;
    suffix?: string;
    prefix?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
}

export function Input({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    suffix,
    prefix,
    error,
    disabled = false,
    className = '',
}: InputProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                        {prefix}
                    </span>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full px-3 py-2 bg-white dark:bg-dark-800 
            border ${error ? 'border-error-500' : 'border-dark-200 dark:border-dark-700'}
            rounded-lg shadow-sm transition-all duration-150
            focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}
          `}
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">
                        {suffix}
                    </span>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-error-500 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                </p>
            )}
        </div>
    );
}

// Checkbox Component
interface CheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
    disabled?: boolean;
}

export function Checkbox({
    label,
    checked,
    onChange,
    description,
    disabled = false,
}: CheckboxProps) {
    return (
        <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
            <div className="relative mt-0.5">
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    className="sr-only"
                />
                <div
                    className={`
            w-5 h-5 rounded border-2 transition-all duration-150
            ${checked
                            ? 'bg-primary-500 border-primary-500'
                            : 'bg-white dark:bg-dark-800 border-dark-300 dark:border-dark-600'
                        }
          `}
                >
                    {checked && <Check className="w-4 h-4 text-white absolute top-0.5 left-0.5" />}
                </div>
            </div>
            <div>
                <span className="text-sm font-medium text-dark-900 dark:text-dark-100">{label}</span>
                {description && (
                    <p className="text-xs text-dark-500 mt-0.5">{description}</p>
                )}
            </div>
        </label>
    );
}

// Button Component
interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    className = '',
    type = 'button',
}: ButtonProps) {
    const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
        secondary: 'bg-dark-100 dark:bg-dark-700 text-dark-900 dark:text-dark-100 hover:bg-dark-200 dark:hover:bg-dark-600 focus:ring-dark-500',
        ghost: 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 focus:ring-dark-500',
        danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500',
    };

    const sizeClasses = {
        sm: 'text-sm px-3 py-1.5',
        md: 'text-sm px-4 py-2',
        lg: 'text-base px-6 py-3',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        >
            {loading ? (
                <svg className="animate-spin w-4 h-4\" viewBox="0 0 24 24">
                    <circle className="opacity-25\" cx="12\" cy="12\" r="10\" stroke="currentColor\" strokeWidth="4\" fill="none" />
                    <path className="opacity-75\" fill="currentColor\" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : icon}
            {children}
        </button>
    );
}

// Button Group Component
interface ButtonGroupProps {
    options: Array<{ value: string; label: string }>;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ButtonGroup({ options, value, onChange, className = '' }: ButtonGroupProps) {
    return (
        <div className={`inline-flex rounded-lg bg-dark-100 dark:bg-dark-800 p-1 ${className}`}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`
            px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150
            ${value === option.value
                            ? 'bg-white dark:bg-dark-700 text-dark-900 dark:text-dark-100 shadow-sm'
                            : 'text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100'
                        }
          `}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

// TextArea Component
interface TextAreaProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    rows?: number;
    disabled?: boolean;
    className?: string;
}

export function TextArea({
    label,
    value,
    onChange,
    placeholder,
    rows = 3,
    disabled = false,
    className = '',
}: TextAreaProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                    {label}
                </label>
            )}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                disabled={disabled}
                className={`
          w-full px-3 py-2 bg-white dark:bg-dark-800 
          border border-dark-200 dark:border-dark-700
          rounded-lg shadow-sm transition-all duration-150
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          disabled:opacity-50 disabled:cursor-not-allowed resize-none
        `}
            />
        </div>
    );
}

// DatePicker Component (simple version)
interface DatePickerProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    className?: string;
}

export function DatePicker({
    label,
    value,
    onChange,
    disabled = false,
    className = '',
}: DatePickerProps) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">
                    {label}
                </label>
            )}
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className={`
          w-full px-3 py-2 bg-white dark:bg-dark-800 
          border border-dark-200 dark:border-dark-700
          rounded-lg shadow-sm transition-all duration-150
          focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
            />
        </div>
    );
}
