// Training Types

export type TrainingStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface TrainingProgress {
    elapsedTime: number; // seconds
    eta: number; // seconds
    progress: number; // 0-100
    currentStep: number;
    totalSteps: number;
    currentRollout: number;
    totalRollouts: number;
    gpuUtil: number; // 0-100
    memoryUsed: number; // GB
    memoryTotal: number; // GB
    throughput: number; // steps/sec
}

export interface LearningCurvePoint {
    step: number;
    episode: number;
    timestamp: number;
    trainReturn: number;
    evalReturn: number;
    rolloutReturn: number;
    policyLoss: number;
    valueLoss: number;
    entropy: number;
    klDivergence: number;
}

export interface ActionStats {
    longFrequency: number;
    flatFrequency: number;
    shortFrequency: number;
    avgHoldTime: number;
    maxHoldTime: number;
    explorationEntropy: number;
}

export interface StateHealth {
    meanCentered: boolean;
    unitVariance: boolean;
    obsCoverage: number; // 0-100
    nanCount: number;
    infCount: number;
}

export interface TradePerformance {
    winRate: number;
    avgPnL: number;
    maxDrawdown: number;
    sharpeRatio: number;
    dailyPnL: number;
    cumulativePnL: number;
}

export interface EpisodeTrade {
    id: number;
    action: 'BUY' | 'SELL' | 'FLAT';
    entryPrice: number;
    exitPrice?: number;
    pnl: number;
    duration: number; // minutes
    timestamp: number;
}

export interface CandleData {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    agentAction?: 'long' | 'flat' | 'short';
    tradeEntry?: boolean;
    tradeExit?: boolean;
}

export interface CurrentEpisode {
    startCapital: number;
    currentEquity: number;
    equityChange: number;
    openPosition: {
        type: 'long' | 'short' | 'flat';
        size: number;
        entryPrice: number;
        currentPrice: number;
        unrealizedPnL: number;
    } | null;
    recentTrades: EpisodeTrade[];
    priceData: CandleData[];
}

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface TrainingLog {
    id: string;
    timestamp: number;
    level: LogLevel;
    message: string;
}

export interface TrainingState {
    experimentId: string;
    experimentName: string;
    status: TrainingStatus;
    progress: TrainingProgress;
    learningCurve: LearningCurvePoint[];
    actionStats: ActionStats;
    stateHealth: StateHealth;
    tradePerformance: TradePerformance;
    currentEpisode: CurrentEpisode;
    logs: TrainingLog[];
    bestCheckpoint: {
        step: number;
        sharpe: number;
        savedAt: number;
    } | null;
}

export interface TrainingCheckpoint {
    id: string;
    step: number;
    epoch: number;
    sharpe: number;
    return: number;
    savedAt: string;
    filePath: string;
}
