import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Pause,
    Square,
    Settings,
    Bell,
    TrendingUp,
    Activity,
    Zap,
    Shield,
    Wifi,
    Database,
    Clock,
    AlertCircle,
    CheckCircle,
    Info,
    XCircle,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import { Button } from '../shared/FormControls';
import { KPICard, StatusBadge } from '../shared/KPICards';
import { CandlestickChart, Sparkline, EquityCurveChart } from '../shared/Charts';
import { useWebSocket } from '../../hooks/useWebSocket';
import { generateCandleSeries, generateAlert, generateLiveTrade } from '../../utils/mockDataGenerator';
import { formatCurrency, formatPercent, formatDate, formatRelativeTime } from '../../utils/formatters';
import type { Alert, LiveTrade, Position } from '../../types/trading';
import type { CandleData } from '../../types/training';

export function LiveTradingDashboard() {
    // Mock data state
    const [status, setStatus] = useState<'connected' | 'paused'>('connected');
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [recentTrades, setRecentTrades] = useState<LiveTrade[]>([]);
    const [priceData, setPriceData] = useState<CandleData[]>(() => {
        // Initialize with agent actions
        const data = generateCandleSeries(80, 42000);
        return data.map((candle, i) => ({
            ...candle,
            agentAction: i === 25 ? 'long' as const : i === 55 ? 'short' as const : i === 70 ? 'long' as const : undefined,
            tradeEntry: i === 25 || i === 55 || i === 70,
            tradeExit: i === 40 || i === 68,
        }));
    });
    const [position, setPosition] = useState<Position>({
        symbol: 'BTCUSDT',
        side: 'long',
        size: 0.05,
        entryPrice: 42300,
        currentPrice: 42520,
        unrealizedPnL: 220,
        unrealizedPnLPercent: 0.52,
    });

    const tradeHistoryRef = useRef<LiveTrade[]>([]);

    const { currentPrice, priceChange, priceChangePercent, priceHistory } = useWebSocket({
        initialPrice: 42520,
        updateInterval: 2000,
    });

    // Update position with current price
    useEffect(() => {
        setPosition(prev => ({
            ...prev,
            currentPrice,
            unrealizedPnL: (currentPrice - prev.entryPrice) * prev.size * (prev.side === 'long' ? 1 : -1),
            unrealizedPnLPercent: ((currentPrice - prev.entryPrice) / prev.entryPrice) * 100 * (prev.side === 'long' ? 1 : -1),
        }));
    }, [currentPrice]);

    // Update price data with new candle
    useEffect(() => {
        if (status !== 'connected') return;

        const interval = setInterval(() => {
            setPriceData(prev => {
                const lastCandle = prev[prev.length - 1];
                const newClose = currentPrice;
                const newHigh = Math.max(lastCandle.high, newClose);
                const newLow = Math.min(lastCandle.low, newClose);

                // Random chance of agent action
                const shouldAct = Math.random() > 0.95;
                const action = shouldAct ? (Math.random() > 0.5 ? 'long' as const : 'short' as const) : undefined;

                const updatedCandles = [...prev.slice(1), {
                    ...lastCandle,
                    close: newClose,
                    high: newHigh,
                    low: newLow,
                    agentAction: action,
                    tradeEntry: shouldAct,
                }];

                return updatedCandles;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [currentPrice, status]);

    // Generate mock alerts periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                setAlerts(prev => [generateAlert(), ...prev.slice(0, 19)]);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Generate mock trades periodically
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) {
                const newTrade = generateLiveTrade(currentPrice);
                setRecentTrades(prev => [newTrade, ...prev.slice(0, 23)]);
                tradeHistoryRef.current = [newTrade, ...tradeHistoryRef.current.slice(0, 99)];
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [currentPrice]);

    // Session summary
    const sessionSummary = {
        pnl: 420,
        pnlPercent: 4.2,
        dailyReturn: 3.2,
        trades: 12,
    };

    const equity = {
        current: 10420,
        start: 10000,
        changePercent: 4.2,
    };

    // Equity curve data
    const equityCurveData = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (30 - i) * 86400000).toISOString().split('T')[0],
        equity: 10000 + Math.sin(i / 5) * 500 + i * 15,
        benchmark: 10000 + i * 10,
    }));

    const agentState = {
        lastAction: 'BUY' as const,
        entryPrice: 42300,
        currentPnL: 220,
        confidence: 87,
        observations: {
            volatility: '1.2% (24h)',
            volume: 'High',
            trend: 'Bullish',
            rsi: 62,
        },
        nextPrediction: {
            action: 'HOLD' as const,
            confidence: 72,
            duration: '1-2 hours',
        },
    };

    const systemHealth = {
        apiConnection: true,
        dataFeed: true,
        modelStatus: true,
        nextRetraining: '2025-12-20 02:00 UTC',
        uptime: 99.8,
    };

    const getAlertIcon = (type: Alert['type']) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-success-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-warning-500" />;
            case 'error': return <XCircle className="w-4 h-4 text-error-500" />;
            default: return <Info className="w-4 h-4 text-primary-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-dark-900 dark:text-white">
                        PPO_BTCUSDT (Paper)
                    </h2>
                    <StatusBadge
                        status={status === 'connected' ? 'success' : 'warning'}
                        label={status === 'connected' ? '✓ LIVE' : '⏸ PAUSED'}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        icon={status === 'connected' ? <Pause className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                        onClick={() => setStatus(s => s === 'connected' ? 'paused' : 'connected')}
                    >
                        {status === 'connected' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button variant="danger" icon={<Square className="w-4 h-4" />}>
                        Stop
                    </Button>
                    <Button variant="ghost" icon={<Settings className="w-4 h-4" />}>
                        Settings
                    </Button>
                    <Button variant="ghost" icon={<Bell className="w-4 h-4" />}>
                        Alerts
                    </Button>
                </div>
            </div>

            {/* Session Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KPICard
                    title="Session P&L"
                    value={sessionSummary.pnl}
                    format="currency"
                    change={sessionSummary.pnlPercent}
                    icon={TrendingUp}
                    variant="success"
                />
                <KPICard
                    title="Daily Return"
                    value={sessionSummary.dailyReturn}
                    format="percent"
                />
                <KPICard
                    title="Session Trades"
                    value={sessionSummary.trades}
                />
                <KPICard
                    title="Current Equity"
                    value={equity.current}
                    format="currency"
                    subtitle={`Start: ${formatCurrency(equity.start)}`}
                    change={equity.changePercent}
                />
            </div>

            {/* Main Candlestick Chart with Agent Actions */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary-500" />
                        Live Agent Actions on Chart
                        <span className="text-xs text-dark-500 ml-2">Real-time trading visualization</span>
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-success-500"></span>
                            <span className="text-dark-500">Long Entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-error-500"></span>
                            <span className="text-dark-500">Short Entry</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded border border-dark-400"></span>
                            <span className="text-dark-500">Exit</span>
                        </div>
                    </div>
                </div>

                {/* Current Price Display */}
                <div className="flex items-center justify-between mb-4 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="text-3xl font-bold text-dark-900 dark:text-white font-mono">
                                {formatCurrency(currentPrice)}
                            </p>
                            <p className={`text-sm flex items-center gap-1 ${priceChange > 0 ? 'text-success-500' : 'text-error-500'}`}>
                                {priceChange > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {formatCurrency(Math.abs(priceChange))} ({formatPercent(priceChangePercent)})
                            </p>
                        </div>
                        <div className="w-32">
                            <Sparkline
                                data={priceHistory.map(p => p.price)}
                                color={priceChange > 0 ? '#10B981' : '#EF4444'}
                            />
                        </div>
                    </div>

                    {/* Current Position */}
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs text-dark-500">Position</p>
                            <p className={`font-bold ${position.side === 'long' ? 'text-success-500' : 'text-error-500'}`}>
                                {position.side.toUpperCase()} {position.size} BTC
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-dark-500">Entry</p>
                            <p className="font-medium text-dark-900 dark:text-white">{formatCurrency(position.entryPrice)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-dark-500">Unrealized P&L</p>
                            <p className={`font-bold ${position.unrealizedPnL > 0 ? 'text-success-500' : 'text-error-500'}`}>
                                {formatCurrency(position.unrealizedPnL)} ({formatPercent(position.unrealizedPnLPercent)})
                            </p>
                        </div>
                    </div>
                </div>

                {/* Full Width Candlestick Chart */}
                <CandlestickChart data={priceData} height={350} />
            </div>

            {/* Equity Curve */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                    Equity Curve (30 Days)
                </h3>
                <EquityCurveChart data={equityCurveData} height={180} />
            </div>

            {/* Agent State & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Agent State Snapshot */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-warning-500" />
                        Agent State
                    </h3>

                    <div className="space-y-4">
                        {/* Last Action */}
                        <div className="p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-dark-500">Last Action</span>
                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-success-100 dark:bg-success-900/30 text-success-600">
                                    {agentState.lastAction}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                    <p className="text-dark-400 text-xs">Entry</p>
                                    <p className="font-medium text-dark-900 dark:text-white">{formatCurrency(agentState.entryPrice)}</p>
                                </div>
                                <div>
                                    <p className="text-dark-400 text-xs">Current P&L</p>
                                    <p className={`font-medium ${agentState.currentPnL > 0 ? 'text-success-500' : 'text-error-500'}`}>
                                        {formatCurrency(agentState.currentPnL)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-dark-400 text-xs">Confidence</p>
                                    <p className="font-medium text-dark-900 dark:text-white">{agentState.confidence}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Next Prediction */}
                        <div className="p-3 border border-dashed border-primary-300 dark:border-primary-700 rounded-lg">
                            <p className="text-xs text-dark-500 mb-2">Next Prediction</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                                        {agentState.nextPrediction.action}
                                    </span>
                                    <span className="text-sm text-dark-500">
                                        {agentState.nextPrediction.confidence}%
                                    </span>
                                </div>
                                <span className="text-sm text-dark-400">
                                    {agentState.nextPrediction.duration}
                                </span>
                            </div>
                        </div>

                        {/* Observations */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between p-2 bg-dark-50 dark:bg-dark-900/50 rounded">
                                <span className="text-dark-500">Volatility</span>
                                <span className="text-dark-900 dark:text-white">{agentState.observations.volatility}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-dark-50 dark:bg-dark-900/50 rounded">
                                <span className="text-dark-500">Volume</span>
                                <span className="text-dark-900 dark:text-white">{agentState.observations.volume}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-dark-50 dark:bg-dark-900/50 rounded">
                                <span className="text-dark-500">Trend</span>
                                <span className="text-success-500">{agentState.observations.trend}</span>
                            </div>
                            <div className="flex justify-between p-2 bg-dark-50 dark:bg-dark-900/50 rounded">
                                <span className="text-dark-500">RSI</span>
                                <span className="text-dark-900 dark:text-white">{agentState.observations.rsi}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Trades */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                        Recent Trades (Last 24h)
                    </h3>
                    <div className="overflow-y-auto max-h-72">
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white dark:bg-dark-800">
                                <tr className="border-b border-dark-200 dark:border-dark-700">
                                    <th className="text-left py-2 text-dark-500">Time</th>
                                    <th className="text-left py-2 text-dark-500">Action</th>
                                    <th className="text-right py-2 text-dark-500">P&L</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTrades.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="py-4 text-center text-dark-400">
                                            No trades yet
                                        </td>
                                    </tr>
                                ) : (
                                    recentTrades.map(trade => (
                                        <tr key={trade.id} className="border-b border-dark-100 dark:border-dark-800">
                                            <td className="py-2 text-dark-500">{formatDate(trade.timestamp, 'HH:mm')}</td>
                                            <td className="py-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${trade.action === 'BUY'
                                                    ? 'bg-success-100 dark:bg-success-900/30 text-success-600'
                                                    : 'bg-error-100 dark:bg-error-900/30 text-error-600'
                                                    }`}>
                                                    {trade.action}
                                                </span>
                                            </td>
                                            <td className={`py-2 text-right font-mono ${trade.pnl > 0 ? 'text-success-500' : 'text-error-500'}`}>
                                                {formatCurrency(trade.pnl)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Alerts & Notifications */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white flex items-center gap-2">
                            <Bell className="w-4 h-4 text-dark-500" />
                            Alerts
                        </h3>
                        <Button variant="ghost" size="sm">
                            Configure
                        </Button>
                    </div>
                    <div className="overflow-y-auto max-h-72 space-y-2">
                        {alerts.length === 0 ? (
                            <p className="py-4 text-center text-dark-400">No alerts yet</p>
                        ) : (
                            alerts.map(alert => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-dark-50 dark:hover:bg-dark-900/50"
                                >
                                    {getAlertIcon(alert.type)}
                                    <div className="flex-1">
                                        <p className="text-sm text-dark-900 dark:text-white">{alert.message}</p>
                                        <p className="text-xs text-dark-400">{formatRelativeTime(alert.timestamp)}</p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-dark-500" />
                    System Health
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <Wifi className={`w-5 h-5 ${systemHealth.apiConnection ? 'text-success-500' : 'text-error-500'}`} />
                        <div>
                            <p className="text-xs text-dark-500">API Connection</p>
                            <p className={`text-sm font-medium ${systemHealth.apiConnection ? 'text-success-500' : 'text-error-500'}`}>
                                {systemHealth.apiConnection ? 'Connected' : 'Disconnected'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <Activity className={`w-5 h-5 ${systemHealth.dataFeed ? 'text-success-500' : 'text-error-500'}`} />
                        <div>
                            <p className="text-xs text-dark-500">Data Feed</p>
                            <p className={`text-sm font-medium ${systemHealth.dataFeed ? 'text-success-500' : 'text-error-500'}`}>
                                {systemHealth.dataFeed ? 'Real-time' : 'Delayed'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <Database className={`w-5 h-5 ${systemHealth.modelStatus ? 'text-success-500' : 'text-error-500'}`} />
                        <div>
                            <p className="text-xs text-dark-500">Model Status</p>
                            <p className={`text-sm font-medium ${systemHealth.modelStatus ? 'text-success-500' : 'text-error-500'}`}>
                                {systemHealth.modelStatus ? 'Loaded' : 'Error'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <Clock className="w-5 h-5 text-primary-500" />
                        <div>
                            <p className="text-xs text-dark-500">Next Retraining</p>
                            <p className="text-sm font-medium text-dark-900 dark:text-white">
                                {systemHealth.nextRetraining}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-success-500" />
                        <div>
                            <p className="text-xs text-dark-500">Uptime (30d)</p>
                            <p className="text-sm font-medium text-success-500">{systemHealth.uptime}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveTradingDashboard;
