// Trading & Backtest Types

export interface Trade {
    id: number;
    entryTime: string;
    exitTime: string;
    action: 'BUY' | 'SELL' | 'SHORT' | 'COVER';
    entryPrice: number;
    exitPrice: number;
    size: number;
    duration: number; // minutes
    pnl: number;
    pnlPercent: number;
    fees: number;
}

export interface BacktestMetrics {
    totalReturn: number;
    totalReturnPercent: number;
    annualReturn: number;
    winRate: number;
    sharpeRatio: number;
    sortinoRatio: number;
    maxDrawdown: number;
    maxDrawdownPercent: number;
    calmarRatio: number;
    profitFactor: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    avgWin: number;
    avgLoss: number;
    bestTrade: number;
    worstTrade: number;
    avgHoldTime: number;
}

export interface EquityPoint {
    timestamp: number;
    date: string;
    equity: number;
    benchmark: number;
    drawdown: number;
    drawdownPercent: number;
}

export interface MonthlyReturn {
    year: number;
    month: number;
    return: number;
}

export interface RollingMetric {
    timestamp: number;
    date: string;
    sharpe: number;
    maxDrawdown: number;
}

export interface BaselineComparison {
    name: string;
    return: number;
    sharpe: number;
    maxDrawdown: number;
    notes: string;
    isBest?: boolean;
    isWorst?: boolean;
}

export interface BacktestResult {
    id: string;
    experimentId: string;
    experimentName: string;
    checkpointId: string;
    startDate: string;
    endDate: string;
    runAt: string;
    metrics: BacktestMetrics;
    benchmarkMetrics: BacktestMetrics;
    equityCurve: EquityPoint[];
    monthlyReturns: MonthlyReturn[];
    rollingMetrics: RollingMetric[];
    trades: Trade[];
    baselineComparisons: BaselineComparison[];
}

// Live Trading Types

export type LiveStatus = 'connected' | 'disconnected' | 'error' | 'paused';

export type AlertType = 'info' | 'warning' | 'success' | 'error';

export interface LiveTrade {
    id: string;
    timestamp: string;
    action: 'BUY' | 'SELL';
    price: number;
    size: number;
    pnl: number;
    isOpen: boolean;
}

export interface Position {
    symbol: string;
    side: 'long' | 'short' | 'flat';
    size: number;
    entryPrice: number;
    currentPrice: number;
    unrealizedPnL: number;
    unrealizedPnLPercent: number;
}

export interface SessionSummary {
    sessionPnL: number;
    sessionPnLPercent: number;
    dailyReturn: number;
    sessionTrades: number;
    vsBaseline: number;
    vsBuyHold: number;
}

export interface EquitySnapshot {
    current: number;
    start: number;
    change: number;
    changePercent: number;
    allocation: number;
    position: Position | null;
    riskLevel: 'low' | 'medium' | 'high';
}

export interface AgentState {
    lastAction: 'BUY' | 'SELL' | 'HOLD';
    entryPrice: number | null;
    currentPnL: number;
    confidence: number;
    observations: {
        volatility: string;
        volume: string;
        trend: string;
        rsi: number;
    };
    nextPrediction: {
        action: 'BUY' | 'SELL' | 'HOLD';
        confidence: number;
        estimatedDuration: string;
    };
}

export interface Alert {
    id: string;
    timestamp: string;
    type: AlertType;
    message: string;
    read: boolean;
}

export interface SystemHealth {
    apiConnection: boolean;
    dataFeed: boolean;
    modelStatus: boolean;
    modelMemory: number;
    nextRetraining: string;
    uptime: number;
}

export interface LiveTradingState {
    experimentId: string;
    experimentName: string;
    status: LiveStatus;
    startTime: string;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
    priceHistory: Array<{ timestamp: number; price: number }>;
    sessionSummary: SessionSummary;
    equity: EquitySnapshot;
    agentState: AgentState;
    recentTrades: LiveTrade[];
    alerts: Alert[];
    systemHealth: SystemHealth;
}
