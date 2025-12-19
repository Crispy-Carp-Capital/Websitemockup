import type { CandleData, LearningCurvePoint, EpisodeTrade, TrainingLog } from '../types/training';
import type { Trade, Alert, LiveTrade, MonthlyReturn, EquityPoint } from '../types/trading';

/**
 * Generate a random number between min and max
 */
function randomBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Generate random OHLCV candle data
 */
export function generateCandle(
    prevClose: number,
    timestamp: number,
    volatility = 0.002
): CandleData {
    const change = (Math.random() - 0.48) * prevClose * volatility * 2;
    const open = prevClose;
    const close = prevClose + change;
    const high = Math.max(open, close) + Math.random() * prevClose * volatility;
    const low = Math.min(open, close) - Math.random() * prevClose * volatility;
    const volume = randomBetween(100, 5000);

    return {
        timestamp,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: Math.round(volume),
    };
}

/**
 * Generate a series of candle data
 */
export function generateCandleSeries(
    count: number,
    startPrice = 42000,
    startTime = Date.now() - count * 3600000,
    intervalMs = 3600000
): CandleData[] {
    const candles: CandleData[] = [];
    let price = startPrice;
    let time = startTime;

    for (let i = 0; i < count; i++) {
        const candle = generateCandle(price, time);
        candles.push(candle);
        price = candle.close;
        time += intervalMs;
    }

    return candles;
}

/**
 * Generate a new learning curve point
 */
export function generateLearningCurvePoint(
    step: number,
    episode: number,
    prevPoint?: LearningCurvePoint
): LearningCurvePoint {
    const improvement = Math.log(episode + 1) / Math.log(200);
    const noise = (Math.random() - 0.5) * 200;

    const baseReturn = 1500 * improvement;
    const trainReturn = Math.max(0, baseReturn + noise);
    const evalReturn = Math.max(0, baseReturn * 0.9 + noise * 0.5);
    const rolloutReturn = Math.max(0, baseReturn * 0.85 + noise * 0.8);

    const policyLoss = Math.max(0.01, 0.5 * (1 - improvement) + Math.random() * 0.02);
    const valueLoss = Math.max(0.05, 1.0 * (1 - improvement) + Math.random() * 0.05);
    const entropy = Math.max(0.1, 1.2 * (1 - improvement * 0.8) + Math.random() * 0.05);
    const klDivergence = 0.01 + Math.random() * 0.005;

    return {
        step,
        episode,
        timestamp: Date.now(),
        trainReturn: prevPoint ? prevPoint.trainReturn * 0.9 + trainReturn * 0.1 : trainReturn,
        evalReturn: prevPoint ? prevPoint.evalReturn * 0.9 + evalReturn * 0.1 : evalReturn,
        rolloutReturn: prevPoint ? prevPoint.rolloutReturn * 0.9 + rolloutReturn * 0.1 : rolloutReturn,
        policyLoss: prevPoint ? prevPoint.policyLoss * 0.95 + policyLoss * 0.05 : policyLoss,
        valueLoss: prevPoint ? prevPoint.valueLoss * 0.95 + valueLoss * 0.05 : valueLoss,
        entropy: prevPoint ? prevPoint.entropy * 0.98 + entropy * 0.02 : entropy,
        klDivergence,
    };
}

/**
 * Generate a random trade
 */
export function generateTrade(id: number, basePrice = 42000): EpisodeTrade {
    const isLong = Math.random() > 0.5;
    const entryPrice = basePrice + (Math.random() - 0.5) * 1000;
    const pnlPercent = (Math.random() - 0.4) * 5;
    const exitPrice = entryPrice * (1 + pnlPercent / 100);
    const pnl = (exitPrice - entryPrice) * 0.05 * (isLong ? 1 : -1);
    const duration = Math.floor(randomBetween(30, 480));

    return {
        id,
        action: isLong ? 'BUY' : 'SELL',
        entryPrice: Math.round(entryPrice * 100) / 100,
        exitPrice: Math.round(exitPrice * 100) / 100,
        pnl: Math.round(pnl * 100) / 100,
        duration,
        timestamp: Date.now() - duration * 60000,
    };
}

/**
 * Generate a live trade
 */
export function generateLiveTrade(basePrice = 42000): LiveTrade {
    const isLong = Math.random() > 0.5;
    const price = basePrice + (Math.random() - 0.5) * 500;
    const size = Math.round(randomBetween(0.01, 0.1) * 1000) / 1000;
    const pnl = (Math.random() - 0.4) * 200;

    return {
        id: `trade-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: isLong ? 'BUY' : 'SELL',
        price: Math.round(price * 100) / 100,
        size,
        pnl: Math.round(pnl * 100) / 100,
        isOpen: Math.random() > 0.8,
    };
}

/**
 * Generate a random alert
 */
export function generateAlert(): Alert {
    const types: Alert['type'][] = ['info', 'warning', 'success', 'error'];
    const messages = {
        info: [
            'New trade executed',
            'Daily P&L update',
            'Model prediction updated',
            'Nightly retraining scheduled',
        ],
        warning: [
            'High volatility detected',
            'Approaching daily loss limit',
            'Low confidence prediction',
            'API rate limit warning',
        ],
        success: [
            'Trade closed with profit',
            'New high equity reached',
            'Model checkpoint saved',
            'Connection restored',
        ],
        error: [
            'Trade execution failed',
            'API connection lost',
            'Model inference error',
            'Insufficient balance',
        ],
    };

    const type = types[Math.floor(Math.random() * types.length)];
    const typeMessages = messages[type];
    const message = typeMessages[Math.floor(Math.random() * typeMessages.length)];

    return {
        id: `alert-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        message,
        read: false,
    };
}

/**
 * Generate a training log entry
 */
export function generateTrainingLog(): TrainingLog {
    const levels: TrainingLog['level'][] = ['INFO', 'INFO', 'INFO', 'WARN', 'DEBUG'];
    const messages = [
        'Checkpoint saved',
        'Episode complete. Reward: +{reward}',
        'Policy updated. Loss: {loss}',
        'Learning rate adjusted',
        'Best model updated (Sharpe: {sharpe})',
        'Gradient clipping applied',
        'High gradient norm detected',
        'Environment reset',
        'Batch processed',
        'Evaluation complete',
    ];

    const level = levels[Math.floor(Math.random() * levels.length)];
    let message = messages[Math.floor(Math.random() * messages.length)];

    message = message
        .replace('{reward}', (Math.random() * 1000 + 500).toFixed(1))
        .replace('{loss}', (Math.random() * 0.1).toFixed(4))
        .replace('{sharpe}', (Math.random() * 2 + 0.5).toFixed(2));

    return {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        level,
        message,
    };
}

/**
 * Generate monthly returns data
 */
export function generateMonthlyReturns(
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
): MonthlyReturn[] {
    const returns: MonthlyReturn[] = [];

    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
        returns.push({
            year,
            month,
            return: Math.round((Math.random() - 0.35) * 15 * 100) / 100,
        });

        month++;
        if (month > 12) {
            month = 1;
            year++;
        }
    }

    return returns;
}

/**
 * Generate equity curve data
 */
export function generateEquityCurve(
    days: number,
    startEquity = 10000,
    startDate = new Date()
): EquityPoint[] {
    const points: EquityPoint[] = [];
    let equity = startEquity;
    let benchmark = startEquity;
    let maxEquity = equity;

    for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() - (days - i));

        const dailyReturn = (Math.random() - 0.45) * 0.03;
        equity *= (1 + dailyReturn);
        maxEquity = Math.max(maxEquity, equity);
        const drawdown = equity - maxEquity;
        const drawdownPercent = (drawdown / maxEquity) * 100;

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
}

/**
 * Generate backtest trades
 */
export function generateBacktestTrades(count: number, startDate = new Date()): Trade[] {
    const trades: Trade[] = [];
    let currentDate = new Date(startDate);

    for (let i = 1; i <= count; i++) {
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
}

/**
 * Update price with realistic tick
 */
export function updatePrice(currentPrice: number, volatility = 0.0002): number {
    const change = (Math.random() - 0.5) * currentPrice * volatility * 2;
    return Math.round((currentPrice + change) * 100) / 100;
}
