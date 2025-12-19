import type { ReactElement } from 'react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    ReferenceLine,
} from 'recharts';
import { formatCurrency, formatPercent, formatDate } from '../../utils/formatters';

// Color palette
const COLORS = {
    primary: '#06B6D4',
    secondary: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: '#6B7280',
    long: '#10B981',
    flat: '#6B7280',
    short: '#EF4444',
};

// Custom Tooltip
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
    }>;
    label?: string;
    formatter?: (value: number, name: string) => string;
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg p-3">
            {label && (
                <p className="text-xs text-dark-500 mb-2">{label}</p>
            )}
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                    <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-dark-600 dark:text-dark-400">{entry.name}:</span>
                    <span className="font-medium text-dark-900 dark:text-dark-100">
                        {formatter ? formatter(entry.value, entry.name) : entry.value.toFixed(2)}
                    </span>
                </div>
            ))}
        </div>
    );
}

// Learning Curve Chart
interface LearningCurveData {
    episode: number;
    trainReturn: number;
    evalReturn: number;
    rolloutReturn?: number;
}

interface LearningCurveChartProps {
    data: LearningCurveData[];
    height?: number;
    showRollout?: boolean;
}

export function LearningCurveChart({
    data,
    height = 200,
    showRollout = true,
}: LearningCurveChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="episode"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatCurrency(v, 0)}
                />
                <Tooltip
                    content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
                />
                <Line
                    type="monotone"
                    dataKey="trainReturn"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    name="Train"
                />
                <Line
                    type="monotone"
                    dataKey="evalReturn"
                    stroke={COLORS.secondary}
                    strokeWidth={2}
                    dot={false}
                    name="Eval"
                />
                {showRollout && (
                    <Line
                        type="monotone"
                        dataKey="rolloutReturn"
                        stroke={COLORS.gray}
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Rollout"
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
}

// Loss Chart
interface LossData {
    episode: number;
    policyLoss: number;
    valueLoss: number;
}

interface LossChartProps {
    data: LossData[];
    height?: number;
    type: 'policy' | 'value';
}

export function LossChart({ data, height = 150, type }: LossChartProps) {
    const dataKey = type === 'policy' ? 'policyLoss' : 'valueLoss';
    const color = type === 'policy' ? COLORS.warning : COLORS.error;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                    <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="episode"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#gradient-${type})`}
                    name={type === 'policy' ? 'Policy Loss' : 'Value Loss'}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// Entropy Chart
interface EntropyData {
    episode: number;
    entropy: number;
    klDivergence: number;
}

interface EntropyChartProps {
    data: EntropyData[];
    height?: number;
}

export function EntropyChart({ data, height = 150 }: EntropyChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="episode"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                    type="monotone"
                    dataKey="entropy"
                    stroke={COLORS.success}
                    strokeWidth={2}
                    dot={false}
                    name="Entropy"
                />
                <Line
                    type="monotone"
                    dataKey="klDivergence"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={false}
                    name="KL Divergence"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

// Action Distribution Pie Chart
interface ActionDistributionProps {
    longFrequency: number;
    flatFrequency: number;
    shortFrequency: number;
    height?: number;
}

export function ActionDistributionChart({
    longFrequency,
    flatFrequency,
    shortFrequency,
    height = 150,
}: ActionDistributionProps) {
    const data = [
        { name: 'Long', value: longFrequency, color: COLORS.long },
        { name: 'Flat', value: flatFrequency, color: COLORS.flat },
        { name: 'Short', value: shortFrequency, color: COLORS.short },
    ];

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip
                    content={<CustomTooltip formatter={(v) => formatPercent(v, 1, false)} />}
                />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value: string) => (
                        <span className="text-xs text-dark-600 dark:text-dark-400">{value}</span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// Equity Curve Chart
interface EquityData {
    date: string;
    equity: number;
    benchmark: number;
}

interface EquityCurveChartProps {
    data: EquityData[];
    height?: number;
}

export function EquityCurveChart({ data, height = 250 }: EquityCurveChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatDate(v, 'MMM yy')}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatCurrency(v, 0)}
                />
                <Tooltip
                    content={<CustomTooltip formatter={(v) => formatCurrency(v)} />}
                />
                <Area
                    type="monotone"
                    dataKey="equity"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fill="url(#equityGradient)"
                    name="RL Model"
                />
                <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke={COLORS.gray}
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Buy & Hold"
                />
                <Legend />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// Drawdown Chart
interface DrawdownData {
    date: string;
    drawdownPercent: number;
}

interface DrawdownChartProps {
    data: DrawdownData[];
    height?: number;
}

export function DrawdownChart({ data, height = 150 }: DrawdownChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <defs>
                    <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.error} stopOpacity={0.5} />
                        <stop offset="95%" stopColor={COLORS.error} stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatDate(v, 'MMM yy')}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatPercent(v, 0, false)}
                />
                <Tooltip
                    content={<CustomTooltip formatter={(v) => formatPercent(v, 2)} />}
                />
                <ReferenceLine y={0} stroke="#374151" />
                <Area
                    type="monotone"
                    dataKey="drawdownPercent"
                    stroke={COLORS.error}
                    strokeWidth={2}
                    fill="url(#drawdownGradient)"
                    name="Drawdown"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
}

// Simple Candlestick (using Bar chart approximation)
interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    agentAction?: 'long' | 'flat' | 'short';
    tradeEntry?: boolean;
    tradeExit?: boolean;
}

interface CandlestickChartProps {
    data: CandleData[];
    height?: number;
}

export function CandlestickChart({ data, height = 300 }: CandlestickChartProps) {
    const processedData = data.map((candle, index) => ({
        ...candle,
        index,
        isGreen: candle.close >= candle.open,
        body: Math.abs(candle.close - candle.open),
        bodyStart: Math.min(candle.open, candle.close),
    }));

    // Custom dot shape for agent actions
    const renderAgentActionDot = (props: { cx: number; cy: number; payload: CandleData & { isGreen: boolean } }): ReactElement | null => {
        const { cx, cy, payload } = props;
        if (!payload?.agentAction && !payload?.tradeEntry && !payload?.tradeExit) return null;

        const isLong = payload.agentAction === 'long';
        const isShort = payload.agentAction === 'short';
        const isEntry = payload.tradeEntry;
        const isExit = payload.tradeExit;

        const elements: ReactElement[] = [];

        if (isLong) {
            // Green up triangle for long entry
            elements.push(
                <g key="long">
                    <polygon
                        points={`${cx},${cy - 18} ${cx - 8},${cy - 6} ${cx + 8},${cy - 6}`}
                        fill={COLORS.long}
                        stroke="white"
                        strokeWidth={1}
                    />
                    <text x={cx} y={cy - 24} textAnchor="middle" fill={COLORS.long} fontSize={10} fontWeight="bold">
                        LONG
                    </text>
                </g>
            );
        }

        if (isShort) {
            // Red down triangle for short entry
            elements.push(
                <g key="short">
                    <polygon
                        points={`${cx},${cy + 18} ${cx - 8},${cy + 6} ${cx + 8},${cy + 6}`}
                        fill={COLORS.error}
                        stroke="white"
                        strokeWidth={1}
                    />
                    <text x={cx} y={cy + 30} textAnchor="middle" fill={COLORS.error} fontSize={10} fontWeight="bold">
                        SHORT
                    </text>
                </g>
            );
        }

        if (isExit && !isLong && !isShort) {
            // Square marker for exit
            elements.push(
                <g key="exit">
                    <rect
                        x={cx - 5}
                        y={cy - 5}
                        width={10}
                        height={10}
                        fill="#6B7280"
                        stroke="white"
                        strokeWidth={1}
                    />
                    <text x={cx} y={cy - 12} textAnchor="middle" fill="#6B7280" fontSize={9}>
                        EXIT
                    </text>
                </g>
            );
        }

        // Highlight circle for any action
        if (isLong || isShort || (isEntry && !isLong && !isShort)) {
            elements.push(
                <circle
                    key="highlight"
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={isLong ? COLORS.long : isShort ? COLORS.error : COLORS.primary}
                    stroke="white"
                    strokeWidth={2}
                    opacity={0.8}
                />
            );
        }

        return <g>{elements}</g>;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <ComposedChart data={processedData} margin={{ top: 35, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="index"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => {
                        const item = processedData[v];
                        return item ? formatDate(item.timestamp, 'HH:mm') : '';
                    }}
                />
                <YAxis
                    domain={['dataMin - 100', 'dataMax + 100']}
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatCurrency(v, 0)}
                />
                <Tooltip
                    content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const candle = payload[0]?.payload as CandleData & { isGreen: boolean };
                        if (!candle) return null;
                        return (
                            <div className="bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg p-3">
                                <p className="text-xs text-dark-500 mb-2">
                                    {formatDate(candle.timestamp, 'MMM d, HH:mm')}
                                </p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <span className="text-dark-500">Open:</span>
                                    <span className="font-mono">{formatCurrency(candle.open, 0)}</span>
                                    <span className="text-dark-500">High:</span>
                                    <span className="font-mono">{formatCurrency(candle.high, 0)}</span>
                                    <span className="text-dark-500">Low:</span>
                                    <span className="font-mono">{formatCurrency(candle.low, 0)}</span>
                                    <span className="text-dark-500">Close:</span>
                                    <span className={`font-mono ${candle.isGreen ? 'text-success-500' : 'text-error-500'}`}>
                                        {formatCurrency(candle.close, 0)}
                                    </span>
                                </div>
                                {(candle.agentAction || candle.tradeEntry || candle.tradeExit) && (
                                    <div className="mt-2 pt-2 border-t border-dark-200 dark:border-dark-700 flex gap-2">
                                        {candle.agentAction && (
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${candle.agentAction === 'long'
                                                ? 'bg-success-500/20 text-success-500'
                                                : candle.agentAction === 'short'
                                                    ? 'bg-error-500/20 text-error-500'
                                                    : 'bg-dark-500/20 text-dark-500'
                                                }`}>
                                                {candle.agentAction.toUpperCase()}
                                            </span>
                                        )}
                                        {candle.tradeEntry && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-500/20 text-primary-500">
                                                ENTRY
                                            </span>
                                        )}
                                        {candle.tradeExit && (
                                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-dark-500/20 text-dark-500">
                                                EXIT
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
                {/* Price line with agent action markers */}
                <Line
                    type="monotone"
                    dataKey="close"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={(props: { cx: number; cy: number; payload: CandleData & { isGreen: boolean } }) =>
                        renderAgentActionDot(props) || <g />
                    }
                    activeDot={{ r: 6, fill: COLORS.primary }}
                    name="Price"
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}

// Rolling Metrics Chart
interface RollingData {
    date: string;
    sharpe?: number;
    maxDrawdown?: number;
}

interface RollingMetricsChartProps {
    data: RollingData[];
    dataKey: 'sharpe' | 'maxDrawdown';
    height?: number;
}

export function RollingMetricsChart({
    data,
    dataKey,
    height = 150,
}: RollingMetricsChartProps) {
    const color = dataKey === 'sharpe' ? COLORS.primary : COLORS.error;

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) => formatDate(v, 'MMM')}
                />
                <YAxis
                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(v) =>
                        dataKey === 'sharpe' ? v.toFixed(1) : formatPercent(v, 0, false)
                    }
                />
                <Tooltip
                    content={
                        <CustomTooltip
                            formatter={(v) =>
                                dataKey === 'sharpe' ? v.toFixed(2) : formatPercent(v)
                            }
                        />
                    }
                />
                <ReferenceLine
                    y={dataKey === 'sharpe' ? 1 : -10}
                    stroke="#374151"
                    strokeDasharray="3 3"
                />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    name={dataKey === 'sharpe' ? '30-day Sharpe' : '30-day Max DD'}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// Mini Sparkline Chart
interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
}

export function Sparkline({ data, color = COLORS.primary, height = 30 }: SparklineProps) {
    const chartData = data.map((value, index) => ({ index, value }));

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={chartData}>
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={1.5}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
