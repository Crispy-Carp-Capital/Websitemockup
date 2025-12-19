import { useEffect, useRef, useCallback } from 'react';
import { useTrainingStore } from '../stores/trainingStore';
import {
    generateLearningCurvePoint,
    generateCandle,
    generateTrainingLog,
} from '../utils/mockDataGenerator';
import type { CandleData } from '../types/training';

interface UseMockTrainingDataOptions {
    updateInterval?: number;
    autoStart?: boolean;
}

/**
 * Hook that simulates real-time training data updates
 */
export function useMockTrainingData(options: UseMockTrainingDataOptions = {}) {
    const { updateInterval = 1500, autoStart = true } = options;

    const {
        status,
        progress,
        learningCurve,
        currentEpisode,
        updateProgress,
        addLearningCurvePoint,
        updateActionStats,
        updateTradePerformance,
        updateCurrentEpisode,
        addLog,
        addPriceCandle,
    } = useTrainingStore();

    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
    const stepRef = useRef(progress.currentStep);
    const episodeRef = useRef(learningCurve.length);

    const simulateUpdate = useCallback(() => {
        if (status !== 'running') return;

        // Update step and progress
        const stepsPerUpdate = 2048;
        stepRef.current += stepsPerUpdate;
        const newProgress = Math.min(
            (stepRef.current / progress.totalSteps) * 100,
            100
        );

        // Calculate new time estimates
        const elapsedSeconds = progress.elapsedTime + updateInterval / 1000;
        const progressRate = newProgress / Math.max(elapsedSeconds, 1);
        const remainingProgress = 100 - newProgress;
        const eta = progressRate > 0 ? remainingProgress / progressRate : 0;

        updateProgress({
            currentStep: stepRef.current,
            progress: Math.round(newProgress * 10) / 10,
            elapsedTime: elapsedSeconds,
            eta: Math.round(eta),
            currentRollout: Math.floor(stepRef.current / stepsPerUpdate),
            gpuUtil: 88 + Math.random() * 10,
            memoryUsed: 17 + Math.random() * 3,
            throughput: 1500 + Math.random() * 500,
        });

        // Add learning curve point every few updates
        if (stepRef.current % (stepsPerUpdate * 3) === 0) {
            episodeRef.current += 1;
            const prevPoint = learningCurve[learningCurve.length - 1];
            const newPoint = generateLearningCurvePoint(
                stepRef.current,
                episodeRef.current,
                prevPoint
            );
            addLearningCurvePoint(newPoint);

            // Update trade performance
            updateTradePerformance({
                cumulativePnL: Math.round(
                    (12450 + episodeRef.current * 50 + (Math.random() - 0.3) * 200) * 100
                ) / 100,
                dailyPnL: Math.round((300 + (Math.random() - 0.3) * 100) * 100) / 100,
                winRate: Math.round((60 + Math.random() * 8) * 10) / 10,
                sharpeRatio: Math.round((1.3 + Math.random() * 0.4) * 100) / 100,
            });
        }

        // Update action stats periodically
        if (Math.random() > 0.7) {
            updateActionStats({
                longFrequency: 33 + Math.random() * 6,
                flatFrequency: 38 + Math.random() * 6,
                shortFrequency: 23 + Math.random() * 6,
                explorationEntropy: 0.6 + Math.random() * 0.3,
            });
        }

        // Add new price candle
        const lastCandle = currentEpisode.priceData[currentEpisode.priceData.length - 1];
        if (lastCandle) {
            const newCandle: CandleData = generateCandle(
                lastCandle.close,
                Date.now()
            );

            // Randomly add agent action
            if (Math.random() > 0.85) {
                const actions: CandleData['agentAction'][] = ['long', 'flat', 'short'];
                newCandle.agentAction = actions[Math.floor(Math.random() * actions.length)];
                newCandle.tradeEntry = newCandle.agentAction !== 'flat';
            }

            addPriceCandle(newCandle);

            // Update current equity
            const equityChange = (Math.random() - 0.4) * 50;
            updateCurrentEpisode({
                currentEquity: currentEpisode.currentEquity + equityChange,
                equityChange:
                    ((currentEpisode.currentEquity + equityChange - currentEpisode.startCapital) /
                        currentEpisode.startCapital) *
                    100,
                openPosition: currentEpisode.openPosition
                    ? {
                        ...currentEpisode.openPosition,
                        currentPrice: newCandle.close,
                        unrealizedPnL:
                            (newCandle.close - currentEpisode.openPosition.entryPrice) *
                            currentEpisode.openPosition.size *
                            (currentEpisode.openPosition.type === 'long' ? 1 : -1),
                    }
                    : null,
            });
        }

        // Add log entries periodically
        if (Math.random() > 0.8) {
            const log = generateTrainingLog();
            addLog(log.level, log.message);
        }

        // Check if training should complete
        if (newProgress >= 100) {
            useTrainingStore.getState().stopTraining();
        }
    }, [
        status,
        progress,
        learningCurve,
        currentEpisode,
        updateProgress,
        addLearningCurvePoint,
        updateActionStats,
        updateTradePerformance,
        updateCurrentEpisode,
        addLog,
        addPriceCandle,
        updateInterval,
    ]);

    useEffect(() => {
        if (autoStart && status === 'running') {
            intervalRef.current = setInterval(simulateUpdate, updateInterval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [status, autoStart, updateInterval, simulateUpdate]);

    const startSimulation = useCallback(() => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(simulateUpdate, updateInterval);
        }
    }, [simulateUpdate, updateInterval]);

    const stopSimulation = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }
    }, []);

    return {
        startSimulation,
        stopSimulation,
        isSimulating: !!intervalRef.current,
    };
}

export default useMockTrainingData;
