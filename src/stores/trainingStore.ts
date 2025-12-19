import { create } from 'zustand';
import type {
    TrainingState,
    TrainingStatus,
    TrainingProgress,
    LearningCurvePoint,
    ActionStats,
    StateHealth,
    TradePerformance,
    CurrentEpisode,
    TrainingLog,
    CandleData,
} from '../types/training';

// Initial mock data
const initialProgress: TrainingProgress = {
    elapsedTime: 8100, // 2h 15m
    eta: 20700, // 5h 45m
    progress: 45,
    currentStep: 225000,
    totalSteps: 500000,
    currentRollout: 110,
    totalRollouts: 244,
    gpuUtil: 92,
    memoryUsed: 18.5,
    memoryTotal: 40,
    throughput: 1667,
};

const initialActionStats: ActionStats = {
    longFrequency: 35,
    flatFrequency: 40,
    shortFrequency: 25,
    avgHoldTime: 2.3,
    maxHoldTime: 24,
    explorationEntropy: 0.72,
};

const initialStateHealth: StateHealth = {
    meanCentered: true,
    unitVariance: true,
    obsCoverage: 40,
    nanCount: 0,
    infCount: 0,
};

const initialTradePerformance: TradePerformance = {
    winRate: 62,
    avgPnL: 45,
    maxDrawdown: 8.5,
    sharpeRatio: 1.45,
    dailyPnL: 320,
    cumulativePnL: 12450,
};

const initialCurrentEpisode: CurrentEpisode = {
    startCapital: 10000,
    currentEquity: 10450,
    equityChange: 4.5,
    openPosition: {
        type: 'long',
        size: 0.05,
        entryPrice: 42300,
        currentPrice: 42520,
        unrealizedPnL: 215,
    },
    recentTrades: [
        { id: 10, action: 'BUY', entryPrice: 42300, pnl: 120, duration: 78, timestamp: Date.now() - 78 * 60000 },
        { id: 9, action: 'SELL', entryPrice: 42100, exitPrice: 42300, pnl: 85, duration: 126, timestamp: Date.now() - 204 * 60000 },
        { id: 8, action: 'BUY', entryPrice: 42050, exitPrice: 42100, pnl: -45, duration: 48, timestamp: Date.now() - 252 * 60000 },
        { id: 7, action: 'FLAT', entryPrice: 41800, exitPrice: 42050, pnl: 235, duration: 252, timestamp: Date.now() - 504 * 60000 },
    ],
    priceData: [],
};

const initialLogs: TrainingLog[] = [
    { id: 'log-1', timestamp: Date.now() - 60000, level: 'INFO', message: 'Step 225000: Checkpoint saved' },
    { id: 'log-2', timestamp: Date.now() - 120000, level: 'INFO', message: 'Episode 110 complete. Reward: +1250.5' },
    { id: 'log-3', timestamp: Date.now() - 180000, level: 'WARN', message: 'High gradient norm detected (2.5). Step 224500' },
    { id: 'log-4', timestamp: Date.now() - 240000, level: 'INFO', message: 'Best model updated (Sharpe: 1.65)' },
    { id: 'log-5', timestamp: Date.now() - 300000, level: 'INFO', message: 'Learning rate adjusted: 3e-4 → 2.8e-4' },
];

interface TrainingStoreState extends TrainingState {
    // Actions
    setStatus: (status: TrainingStatus) => void;
    updateProgress: (progress: Partial<TrainingProgress>) => void;
    addLearningCurvePoint: (point: LearningCurvePoint) => void;
    updateActionStats: (stats: Partial<ActionStats>) => void;
    updateStateHealth: (health: Partial<StateHealth>) => void;
    updateTradePerformance: (perf: Partial<TradePerformance>) => void;
    updateCurrentEpisode: (episode: Partial<CurrentEpisode>) => void;
    addLog: (level: TrainingLog['level'], message: string) => void;
    addPriceCandle: (candle: CandleData) => void;
    reset: () => void;
    startTraining: (experimentId: string, experimentName: string) => void;
    pauseTraining: () => void;
    resumeTraining: () => void;
    stopTraining: () => void;
}

// Generate initial learning curve data
const generateInitialLearningCurve = (): LearningCurvePoint[] => {
    const points: LearningCurvePoint[] = [];
    for (let i = 0; i <= 110; i++) {
        const step = i * 2048;
        const noise = (Math.random() - 0.5) * 200;
        const trend = Math.log(i + 1) * 300;
        points.push({
            step,
            episode: i,
            timestamp: Date.now() - (110 - i) * 60000,
            trainReturn: Math.max(0, trend + noise),
            evalReturn: Math.max(0, trend * 0.9 + noise * 0.5),
            rolloutReturn: Math.max(0, trend * 0.85 + noise * 0.8),
            policyLoss: Math.max(0.01, 0.5 - i * 0.004 + Math.random() * 0.02),
            valueLoss: Math.max(0.05, 1.0 - i * 0.008 + Math.random() * 0.05),
            entropy: Math.max(0.1, 1.2 - i * 0.008 + Math.random() * 0.05),
            klDivergence: 0.01 + Math.random() * 0.005,
        });
    }
    return points;
};

// Generate initial price data
const generateInitialPriceData = (): CandleData[] => {
    const candles: CandleData[] = [];
    let price = 41500;
    for (let i = 0; i < 200; i++) {
        const change = (Math.random() - 0.48) * 100;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.random() * 50;
        const low = Math.min(open, close) - Math.random() * 50;
        const volume = 1000 + Math.random() * 5000;

        let agentAction: CandleData['agentAction'] = undefined;
        if (i % 15 === 0) agentAction = 'long';
        else if (i % 23 === 0) agentAction = 'short';
        else if (i % 10 === 0) agentAction = 'flat';

        candles.push({
            timestamp: Date.now() - (200 - i) * 3600000,
            open,
            high,
            low,
            close,
            volume,
            agentAction,
            tradeEntry: i % 15 === 0 || i % 23 === 0,
            tradeExit: i % 18 === 0 || i % 27 === 0,
        });
        price = close;
    }
    return candles;
};

export const useTrainingStore = create<TrainingStoreState>((set, get) => ({
    // Initial state
    experimentId: 'exp-002',
    experimentName: 'DQN_ETHUSDT_ICT',
    status: 'running',
    progress: initialProgress,
    learningCurve: generateInitialLearningCurve(),
    actionStats: initialActionStats,
    stateHealth: initialStateHealth,
    tradePerformance: initialTradePerformance,
    currentEpisode: {
        ...initialCurrentEpisode,
        priceData: generateInitialPriceData(),
    },
    logs: initialLogs,
    bestCheckpoint: {
        step: 200000,
        sharpe: 1.65,
        savedAt: Date.now() - 3600000,
    },

    // Actions
    setStatus: (status) => set({ status }),

    updateProgress: (progress) =>
        set((state) => ({
            progress: { ...state.progress, ...progress },
        })),

    addLearningCurvePoint: (point) =>
        set((state) => ({
            learningCurve: [...state.learningCurve, point],
        })),

    updateActionStats: (stats) =>
        set((state) => ({
            actionStats: { ...state.actionStats, ...stats },
        })),

    updateStateHealth: (health) =>
        set((state) => ({
            stateHealth: { ...state.stateHealth, ...health },
        })),

    updateTradePerformance: (perf) =>
        set((state) => ({
            tradePerformance: { ...state.tradePerformance, ...perf },
        })),

    updateCurrentEpisode: (episode) =>
        set((state) => ({
            currentEpisode: { ...state.currentEpisode, ...episode },
        })),

    addLog: (level, message) =>
        set((state) => ({
            logs: [
                { id: `log-${Date.now()}`, timestamp: Date.now(), level, message },
                ...state.logs.slice(0, 99),
            ],
        })),

    addPriceCandle: (candle) =>
        set((state) => ({
            currentEpisode: {
                ...state.currentEpisode,
                priceData: [...state.currentEpisode.priceData.slice(-199), candle],
            },
        })),

    reset: () =>
        set({
            status: 'idle',
            progress: { ...initialProgress, progress: 0, currentStep: 0, elapsedTime: 0 },
            learningCurve: [],
            actionStats: initialActionStats,
            stateHealth: initialStateHealth,
            tradePerformance: { ...initialTradePerformance, cumulativePnL: 0 },
            currentEpisode: initialCurrentEpisode,
            logs: [],
            bestCheckpoint: null,
        }),

    startTraining: (experimentId, experimentName) =>
        set({
            experimentId,
            experimentName,
            status: 'running',
            progress: { ...initialProgress, progress: 0, currentStep: 0, elapsedTime: 0, eta: 28800 },
            learningCurve: [],
            logs: [{ id: 'log-start', timestamp: Date.now(), level: 'INFO', message: `Training started for ${experimentName}` }],
        }),

    pauseTraining: () => {
        set({ status: 'paused' });
        get().addLog('INFO', 'Training paused');
    },

    resumeTraining: () => {
        set({ status: 'running' });
        get().addLog('INFO', 'Training resumed');
    },

    stopTraining: () => {
        set({ status: 'completed' });
        get().addLog('INFO', 'Training stopped. Final checkpoint saved.');
    },
}));
