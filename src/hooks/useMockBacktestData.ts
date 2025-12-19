import { useCallback } from 'react';
import { useBacktestStore } from '../stores/backTestStore';

interface UseMockBacktestDataOptions {
    simulateDelay?: number;
}

/**
 * Hook for managing mock backtest data
 */
export function useMockBacktestData(options: UseMockBacktestDataOptions = {}) {
    const { simulateDelay = 2000 } = options;

    const { result, isLoading, error, runBacktest, clearResult } = useBacktestStore();

    const startBacktest = useCallback(
        (experimentId: string, experimentName: string) => {
            runBacktest(experimentId, experimentName);
        },
        [runBacktest]
    );

    const getFilteredTrades = useCallback(
        (filter?: { action?: 'BUY' | 'SELL' | 'SHORT' | 'COVER'; pnlPositive?: boolean }) => {
            if (!result) return [];

            let trades = result.trades;

            if (filter?.action) {
                trades = trades.filter((t) => t.action === filter.action);
            }

            if (filter?.pnlPositive !== undefined) {
                trades = trades.filter((t) =>
                    filter.pnlPositive ? t.pnl > 0 : t.pnl < 0
                );
            }

            return trades;
        },
        [result]
    );

    const getMonthlyReturnsByYear = useCallback(
        (year: number) => {
            if (!result) return [];
            return result.monthlyReturns.filter((r) => r.year === year);
        },
        [result]
    );

    const getSummaryStats = useCallback(() => {
        if (!result) return null;

        const { metrics, benchmarkMetrics } = result;

        return {
            returnVsBenchmark:
                metrics.totalReturnPercent - benchmarkMetrics.totalReturnPercent,
            sharpeVsBenchmark: metrics.sharpeRatio - benchmarkMetrics.sharpeRatio,
            drawdownImprovement:
                benchmarkMetrics.maxDrawdownPercent - metrics.maxDrawdownPercent,
            outperformed: metrics.totalReturnPercent > benchmarkMetrics.totalReturnPercent,
        };
    }, [result]);

    return {
        result,
        isLoading,
        error,
        startBacktest,
        clearResult,
        getFilteredTrades,
        getMonthlyReturnsByYear,
        getSummaryStats,
        simulateDelay,
    };
}

export default useMockBacktestData;
