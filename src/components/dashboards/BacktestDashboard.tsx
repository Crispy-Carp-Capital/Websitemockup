import React, { useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    SortingState,
} from '@tanstack/react-table';
import {
    Download,
    Share2,
    FileText,
    TrendingUp,
    TrendingDown,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Eye,
    FastForward,
} from 'lucide-react';
import { useBacktestStore } from '../../stores/backTestStore';
import { Button, ButtonGroup } from '../shared/FormControls';
import { KPICard, ComparisonTable } from '../shared/KPICards';
import { EquityCurveChart, DrawdownChart, RollingMetricsChart, CandlestickChart } from '../shared/Charts';
import { formatCurrency, formatPercent, formatRatio, formatDate, formatMinutes } from '../../utils/formatters';
import { generateCandleSeries } from '../../utils/mockDataGenerator';
import type { Trade, MonthlyReturn } from '../../types/trading';
import type { CandleData } from '../../types/training';

// Backtest Replay Monitor Component
interface BacktestSnapshot {
    dayIndex: number;
    date: string;
    priceData: CandleData[];
    equity: number;
    pnl: number;
    trades: number;
    winRate: number;
    currentPosition: 'long' | 'short' | 'flat';
    unrealizedPnL: number;
}

function BacktestReplayMonitor({ trades }: { trades: Trade[] }) {
    const [snapshots, setSnapshots] = useState<BacktestSnapshot[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1);

    // Generate snapshots based on trades
    useEffect(() => {
        const snapshotList: BacktestSnapshot[] = [];
        const totalDays = 365;
        let cumulativePnL = 0;
        let tradeCount = 0;
        let wins = 0;

        for (let day = 0; day < totalDays; day += 7) { // Weekly snapshots
            const dateStr = new Date(Date.now() - (totalDays - day) * 86400000).toISOString().split('T')[0];

            // Find trades up to this date
            const tradesUpToDay = trades.filter((_, i) => i <= Math.floor((day / totalDays) * trades.length));
            cumulativePnL = tradesUpToDay.reduce((sum, t) => sum + t.pnl, 0);
            tradeCount = tradesUpToDay.length;
            wins = tradesUpToDay.filter(t => t.pnl > 0).length;

            // Generate price data with trade markers
            const priceData = generateCandleSeries(60, 40000 + day * 20).map((candle, i) => {
                return {
                    ...candle,
                    agentAction: i === 15 ? 'long' as const : i === 45 ? 'short' as const : undefined,
                    tradeEntry: i === 15,
                    tradeExit: i === 45,
                };
            });

            snapshotList.push({
                dayIndex: day,
                date: dateStr,
                priceData,
                equity: 10000 + cumulativePnL,
                pnl: cumulativePnL,
                trades: tradeCount,
                winRate: tradeCount > 0 ? (wins / tradeCount) * 100 : 0,
                currentPosition: Math.random() > 0.6 ? 'long' : Math.random() > 0.5 ? 'short' : 'flat',
                unrealizedPnL: (Math.random() - 0.3) * 500,
            });
        }

        setSnapshots(snapshotList);
        setCurrentIndex(snapshotList.length - 1);
    }, [trades]);

    // Auto-play effect
    useEffect(() => {
        if (!isPlaying || currentIndex >= snapshots.length - 1) {
            setIsPlaying(false);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((prev) => Math.min(prev + 1, snapshots.length - 1));
        }, 1000 / playSpeed);

        return () => clearInterval(interval);
    }, [isPlaying, currentIndex, snapshots.length, playSpeed]);

    const current = snapshots[currentIndex] || snapshots[snapshots.length - 1];

    if (!current) {
        return (
            <div className="text-center py-8 text-dark-500">
                Loading backtest replay...
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Replay Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentIndex(0)}
                        disabled={currentIndex === 0}
                        icon={<SkipBack className="w-4 h-4" />}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    />
                    <Button
                        variant={isPlaying ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                        icon={isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentIndex(Math.min(snapshots.length - 1, currentIndex + 1))}
                        disabled={currentIndex >= snapshots.length - 1}
                        icon={<ChevronRight className="w-4 h-4" />}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentIndex(snapshots.length - 1)}
                        disabled={currentIndex >= snapshots.length - 1}
                        icon={<SkipForward className="w-4 h-4" />}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <FastForward className="w-4 h-4 text-dark-500" />
                    <ButtonGroup
                        value={String(playSpeed)}
                        onChange={(v) => setPlaySpeed(Number(v))}
                        options={[
                            { value: '1', label: '1x' },
                            { value: '2', label: '2x' },
                            { value: '4', label: '4x' },
                        ]}
                    />
                </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
                <input
                    type="range"
                    min={0}
                    max={snapshots.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(Number(e.target.value))}
                    className="w-full"
                />
                <div className="flex justify-between text-xs text-dark-500">
                    <span>{snapshots[0]?.date || 'Start'}</span>
                    <span className="font-medium text-primary-500">
                        {current.date} (Week {currentIndex + 1})
                    </span>
                    <span>{snapshots[snapshots.length - 1]?.date || 'End'}</span>
                </div>
            </div>

            {/* Snapshot Stats */}
            <div className="grid grid-cols-5 gap-3">
                <div className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-dark-500">Equity</p>
                    <p className={`font-bold ${current.pnl > 0 ? 'text-success-500' : 'text-error-500'}`}>
                        {formatCurrency(current.equity)}
                    </p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-dark-500">P&L</p>
                    <p className={`font-bold ${current.pnl > 0 ? 'text-success-500' : 'text-error-500'}`}>
                        {formatCurrency(current.pnl)}
                    </p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-dark-500">Win Rate</p>
                    <p className="font-bold text-dark-900 dark:text-white">
                        {formatPercent(current.winRate, 0, false)}
                    </p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-dark-500">Trades</p>
                    <p className="font-bold text-dark-900 dark:text-white">{current.trades}</p>
                </div>
                <div className="bg-dark-50 dark:bg-dark-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-dark-500">Position</p>
                    <p className={`font-bold ${current.currentPosition === 'long' ? 'text-success-500' :
                        current.currentPosition === 'short' ? 'text-error-500' :
                            'text-dark-500'
                        }`}>
                        {current.currentPosition.toUpperCase()}
                    </p>
                </div>
            </div>

            {/* Candlestick Chart with Agent Actions */}
            <div>
                <h4 className="text-sm font-medium text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary-500" />
                    Agent Actions on Test Set - {current.date}
                </h4>
                <CandlestickChart data={current.priceData} height={280} />
            </div>
        </div>
    );
}

// Monthly Heatmap Component
function MonthlyHeatmap({ data }: { data: MonthlyReturn[] }) {
    const years = [...new Set(data.map(d => d.year))].sort();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const getColor = (value: number) => {
        if (value > 5) return 'bg-success-500 text-white';
        if (value > 2) return 'bg-success-400 text-white';
        if (value > 0) return 'bg-success-200 text-success-800';
        if (value > -2) return 'bg-error-200 text-error-800';
        if (value > -5) return 'bg-error-400 text-white';
        return 'bg-error-500 text-white';
    };

    const findReturn = (year: number, month: number) => {
        const item = data.find(d => d.year === year && d.month === month);
        return item?.return;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className="py-2 px-2 text-left text-dark-500">Year</th>
                        {months.map(m => (
                            <th key={m} className="py-2 px-2 text-center text-dark-500 text-xs">{m}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {years.map(year => (
                        <tr key={year}>
                            <td className="py-2 px-2 font-medium text-dark-900 dark:text-white">{year}</td>
                            {months.map((_, i) => {
                                const ret = findReturn(year, i + 1);
                                return (
                                    <td key={i} className="py-1 px-1">
                                        {ret !== undefined ? (
                                            <div className={`text-center py-1 px-2 rounded text-xs font-medium ${getColor(ret)}`}>
                                                {ret > 0 ? '+' : ''}{ret.toFixed(1)}%
                                            </div>
                                        ) : (
                                            <div className="text-center py-1 px-2 text-dark-300">-</div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Trade Log Table with TanStack Table
const columnHelper = createColumnHelper<Trade>();

const columns = [
    columnHelper.accessor('id', {
        header: '#',
        cell: info => info.getValue(),
    }),
    columnHelper.accessor('entryTime', {
        header: 'Entry Time',
        cell: info => formatDate(info.getValue(), 'MMM d, HH:mm'),
    }),
    columnHelper.accessor('action', {
        header: 'Action',
        cell: info => {
            const action = info.getValue();
            return (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${action === 'BUY' ? 'bg-success-100 dark:bg-success-900/30 text-success-600' :
                    action === 'SHORT' ? 'bg-error-100 dark:bg-error-900/30 text-error-600' :
                        'bg-dark-100 dark:bg-dark-700 text-dark-600'
                    }`}>
                    {action}
                </span>
            );
        },
    }),
    columnHelper.accessor('entryPrice', {
        header: 'Entry',
        cell: info => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('exitPrice', {
        header: 'Exit',
        cell: info => formatCurrency(info.getValue()),
    }),
    columnHelper.accessor('duration', {
        header: 'Duration',
        cell: info => formatMinutes(info.getValue()),
    }),
    columnHelper.accessor('pnl', {
        header: 'P&L',
        cell: info => {
            const pnl = info.getValue();
            return (
                <span className={`font-mono ${pnl > 0 ? 'text-success-500' : 'text-error-500'}`}>
                    {formatCurrency(pnl)}
                </span>
            );
        },
    }),
];

function TradeLogTable({ trades }: { trades: Trade[] }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const table = useReactTable({
        data: trades,
        columns,
        state: { sorting, globalFilter },
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: { pageSize: 15 },
        },
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <input
                    type="text"
                    placeholder="Search trades..."
                    value={globalFilter}
                    onChange={e => setGlobalFilter(e.target.value)}
                    className="px-3 py-1.5 text-sm bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Button variant="ghost" size="sm" icon={<Download className="w-4 h-4" />}>
                    Export CSV
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id} className="border-b border-dark-200 dark:border-dark-700">
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="text-left py-3 px-3 font-medium text-dark-500 cursor-pointer hover:text-dark-900 dark:hover:text-dark-100"
                                        onClick={header.column.getToggleSortingHandler()}
                                    >
                                        <div className="flex items-center gap-1">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <ArrowUpDown className="w-3 h-3" />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="border-b border-dark-100 dark:border-dark-800 hover:bg-dark-50 dark:hover:bg-dark-900/50">
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="py-2 px-3">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-dark-500">
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, trades.length)} of {trades.length}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        icon={<ChevronLeft className="w-4 h-4" />}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        icon={<ChevronRight className="w-4 h-4" />}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function BacktestDashboard() {
    const { result } = useBacktestStore();

    if (!result) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <p className="text-dark-500">No backtest results available.</p>
                    <p className="text-sm text-dark-400 mt-1">Run a backtest from the experiment wizard first.</p>
                </div>
            </div>
        );
    }

    const { metrics, benchmarkMetrics, equityCurve, monthlyReturns, rollingMetrics, trades, baselineComparisons } = result;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                        {result.experimentName}
                    </h2>
                    <p className="text-dark-500 mt-1">
                        Backtest: {formatDate(result.startDate, 'MMM yyyy')} → {formatDate(result.endDate, 'MMM yyyy')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" icon={<FileText className="w-4 h-4" />}>
                        Export PDF
                    </Button>
                    <Button variant="ghost" icon={<Share2 className="w-4 h-4" />}>
                        Share
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard
                    title="Total Return"
                    value={metrics.totalReturnPercent}
                    format="percent"
                    subtitle={`vs B&H: ${formatPercent(metrics.totalReturnPercent - benchmarkMetrics.totalReturnPercent)}`}
                    variant={metrics.totalReturnPercent > benchmarkMetrics.totalReturnPercent ? 'success' : 'default'}
                    icon={metrics.totalReturnPercent > 0 ? TrendingUp : TrendingDown}
                />
                <KPICard
                    title="Annual Return"
                    value={metrics.annualReturn}
                    format="percent"
                />
                <KPICard
                    title="Win Rate"
                    value={metrics.winRate}
                    format="percent"
                />
                <KPICard
                    title="Sharpe Ratio"
                    value={metrics.sharpeRatio}
                    format="ratio"
                    subtitle={`vs B&H: ${formatRatio(benchmarkMetrics.sharpeRatio)}`}
                />
                <KPICard
                    title="Max Drawdown"
                    value={metrics.maxDrawdownPercent}
                    format="percent"
                    variant="error"
                />
                <KPICard
                    title="Total Trades"
                    value={metrics.totalTrades}
                />
            </div>

            {/* Backtest Replay Monitor */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary-500" />
                    Test Set Replay Monitor
                    <span className="text-xs text-dark-500 ml-2">
                        (Weekly snapshots showing agent performance)
                    </span>
                </h3>
                <BacktestReplayMonitor trades={trades} />
            </div>

            {/* Equity Curve & Drawdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        Equity Curve
                    </h3>
                    <EquityCurveChart data={equityCurve} height={250} />
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        Underwater Plot (Drawdown)
                    </h3>
                    <DrawdownChart data={equityCurve} height={250} />
                </div>
            </div>

            {/* Monthly Heatmap */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                    Monthly Performance
                </h3>
                <MonthlyHeatmap data={monthlyReturns} />
            </div>

            {/* Trade Analysis & Rolling Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Trade Analysis */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        Trade Analysis
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-dark-500">Winning Trades</span>
                            <span className="font-medium text-success-500">
                                {metrics.winningTrades} ({formatPercent(metrics.winRate, 0, false)})
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-dark-500">Losing Trades</span>
                            <span className="font-medium text-error-500">
                                {metrics.losingTrades} ({formatPercent(100 - metrics.winRate, 0, false)})
                            </span>
                        </div>
                        <div className="border-t border-dark-200 dark:border-dark-700 pt-3 mt-3">
                            <div className="flex justify-between mb-2">
                                <span className="text-dark-500">Avg Win</span>
                                <span className="font-medium text-success-500">{formatCurrency(metrics.avgWin)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-dark-500">Avg Loss</span>
                                <span className="font-medium text-error-500">{formatCurrency(metrics.avgLoss)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-dark-500">Best Trade</span>
                                <span className="font-medium text-success-500">{formatCurrency(metrics.bestTrade)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-500">Worst Trade</span>
                                <span className="font-medium text-error-500">{formatCurrency(metrics.worstTrade)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rolling Sharpe */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        30-Day Rolling Sharpe
                    </h3>
                    <RollingMetricsChart data={rollingMetrics} dataKey="sharpe" height={180} />
                </div>

                {/* Rolling Max DD */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        30-Day Rolling Max Drawdown
                    </h3>
                    <RollingMetricsChart data={rollingMetrics} dataKey="maxDrawdown" height={180} />
                </div>
            </div>

            {/* Trade Log */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                    Trade Log
                </h3>
                <TradeLogTable trades={trades} />
            </div>

            {/* Comparison Table */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                    Comparison to Baselines
                </h3>
                <ComparisonTable
                    headers={['Strategy', 'Return', 'Sharpe', 'Max DD']}
                    rows={baselineComparisons.map(b => ({
                        name: b.name,
                        values: [
                            { value: b.return, format: 'percent' },
                            { value: b.sharpe, format: 'ratio' },
                            { value: b.maxDrawdown, format: 'percent' },
                        ],
                        isBest: b.isBest,
                        isWorst: b.isWorst,
                    }))}
                />
            </div>
        </div>
    );
}

export default BacktestDashboard;
