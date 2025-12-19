import { create } from 'zustand';
import type {
    BacktestResult,
    BacktestMetrics,
    EquityPoint,
    MonthlyReturn,
    RollingMetric,
    Trade,
    BaselineComparison,
} from '../types/trading';

// Generate mock equity curve
const generateEquityCurve = (): EquityPoint[] => {
    const points: EquityPoint[] = [];
    let equity = 10000;
    let benchmark = 10000;
    let maxEquity = equity;

    const startDate = new Date('2024-06-01');

    for (let i = 0; i < 365; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // RL model returns (slightly better than benchmark)
        const dailyReturn = (Math.random() - 0.45) * 0.03;
        equity *= (1 + dailyReturn);
        maxEquity = Math.max(maxEquity, equity);
        const drawdown = equity - maxEquity;
        const drawdownPercent = (drawdown / maxEquity) * 100;

        // Benchmark returns
        const benchmarkReturn = (Math.random() - 0.48) * 0.025;
        benchmark *= (1 + benchmarkReturn);

        points.push({
            timestamp: date.getTime(),
            date: date.toISOString().split('T')[0],
            equity: Math.round(equity * 100) / 100,
            benchmark: Math.round(benchmark * 100) / 100,
            drawdown: Math.round(drawdown * 100) / 100,
            drawdownPercent: Math.round(drawdownPercent * 100) / 100,
        });
    }
    return points;
};

// Generate mock monthly returns
const generateMonthlyReturns = (): MonthlyReturn[] => {
    const returns: MonthlyReturn[] = [];
    for (let year = 2024; year <= 2025; year++) {
        const startMonth = year === 2024 ? 6 : 1;
        const endMonth = year === 2025 ? 12 : 12;
        for (let month = startMonth; month <= endMonth; month++) {
            returns.push({
                year,
                month,
                return: Math.round((Math.random() - 0.35) * 15 * 100) / 100,
            });
        }
    }
    return returns;
};

// Generate mock trades
const generateTrades = (): Trade[] => {
    const trades: Trade[] = [];
    let currentDate = new Date('2024-06-01');

    for (let i = 1; i <= 156; i++) {
        const daysToAdd = Math.floor(Math.random() * 3) + 1;
        currentDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

        const entryPrice = 40000 + Math.random() * 5000;
        const isWin = Math.random() > 0.38;
        const pnlPercent = isWin
            ? Math.random() * 3 + 0.5
            : -(Math.random() * 2 + 0.3);
        const exitPrice = entryPrice * (1 + pnlPercent / 100);
        const size = Math.random() * 0.1 + 0.01;
        const duration = Math.floor(Math.random() * 1440) + 30;
        const pnl = size * (exitPrice - entryPrice);
        const fees = size * entryPrice * 0.001;

        const exitDate = new Date(currentDate.getTime() + duration * 60000);

        trades.push({
            id: i,
            entryTime: currentDate.toISOString(),
            exitTime: exitDate.toISOString(),
            action: Math.random() > 0.5 ? 'BUY' : 'SHORT',
            entryPrice: Math.round(entryPrice * 100) / 100,
            exitPrice: Math.round(exitPrice * 100) / 100,
            size: Math.round(size * 10000) / 10000,
            duration,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100,
            fees: Math.round(fees * 100) / 100,
        });
    }
    return trades;
};

// Generate rolling metrics
const generateRollingMetrics = (): RollingMetric[] => {
    const metrics: RollingMetric[] = [];
    const startDate = new Date('2024-07-01');

    for (let i = 0; i < 335; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        metrics.push({
            timestamp: date.getTime(),
            date: date.toISOString().split('T')[0],
            sharpe: 1.5 + Math.sin(i / 30) * 0.5 + (Math.random() - 0.5) * 0.3,
            maxDrawdown: -(5 + Math.abs(Math.sin(i / 20)) * 8 + Math.random() * 3),
        });
    }
    return metrics;
};

const mockMetrics: BacktestMetrics = {
    totalReturn: 4520,
    totalReturnPercent: 45.2,
    annualReturn: 28.3,
    winRate: 62.5,
    sharpeRatio: 1.87,
    sortinoRatio: 2.34,
    maxDrawdown: -1230,
    maxDrawdownPercent: -12.3,
    calmarRatio: 2.30,
    profitFactor: 1.95,
    totalTrades: 156,
    winningTrades: 98,
    losingTrades: 58,
    avgWin: 85.3,
    avgLoss: -42.1,
    bestTrade: 485,
    worstTrade: -215,
    avgHoldTime: 180,
};

const mockBenchmarkMetrics: BacktestMetrics = {
    totalReturn: 3800,
    totalReturnPercent: 38.0,
    annualReturn: 24.1,
    winRate: 52.0,
    sharpeRatio: 1.23,
    sortinoRatio: 1.56,
    maxDrawdown: -1850,
    maxDrawdownPercent: -18.5,
    calmarRatio: 1.30,
    profitFactor: 1.45,
    totalTrades: 1,
    winningTrades: 1,
    losingTrades: 0,
    avgWin: 3800,
    avgLoss: 0,
    bestTrade: 3800,
    worstTrade: 0,
    avgHoldTime: 525600,
};

const mockBaselineComparisons: BaselineComparison[] = [
    {
        name: 'RL Model (ours)',
        return: 45.2,
        sharpe: 1.87,
        maxDrawdown: -12.3,
        notes: 'BEST',
        isBest: true,
    },
    {
        name: 'Buy & Hold',
        return: 38.0,
        sharpe: 1.23,
        maxDrawdown: -18.5,
        notes: '',
    },
    {
        name: 'MA Crossover (12/26)',
        return: 22.1,
        sharpe: 0.85,
        maxDrawdown: -15.2,
        notes: '',
    },
    {
        name: 'Random Trading',
        return: -2.3,
        sharpe: -0.12,
        maxDrawdown: -45.0,
        notes: 'WORST',
        isWorst: true,
    },
];

interface BacktestStoreState {
    result: BacktestResult | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    runBacktest: (experimentId: string, experimentName: string) => void;
    clearResult: () => void;
}

export const useBacktestStore = create<BacktestStoreState>((set) => ({
    result: {
        id: 'bt-001',
        experimentId: 'exp-001',
        experimentName: 'PPO_BTCUSDT_v1',
        checkpointId: 'ckpt-best-sharpe',
        startDate: '2024-06-01',
        endDate: '2025-12-19',
        runAt: new Date().toISOString(),
        metrics: mockMetrics,
        benchmarkMetrics: mockBenchmarkMetrics,
        equityCurve: generateEquityCurve(),
        monthlyReturns: generateMonthlyReturns(),
        rollingMetrics: generateRollingMetrics(),
        trades: generateTrades(),
        baselineComparisons: mockBaselineComparisons,
    },
    isLoading: false,
    error: null,

    runBacktest: (experimentId, experimentName) => {
        set({ isLoading: true, error: null });

        // Simulate async backtest
        setTimeout(() => {
            set({
                isLoading: false,
                result: {
                    id: `bt-${Date.now()}`,
                    experimentId,
                    experimentName,
                    checkpointId: 'ckpt-best-sharpe',
                    startDate: '2024-06-01',
                    endDate: '2025-12-19',
                    runAt: new Date().toISOString(),
                    metrics: mockMetrics,
                    benchmarkMetrics: mockBenchmarkMetrics,
                    equityCurve: generateEquityCurve(),
                    monthlyReturns: generateMonthlyReturns(),
                    rollingMetrics: generateRollingMetrics(),
                    trades: generateTrades(),
                    baselineComparisons: mockBaselineComparisons,
                },
            });
        }, 2000);
    },

    clearResult: () => set({ result: null, error: null }),
}));
