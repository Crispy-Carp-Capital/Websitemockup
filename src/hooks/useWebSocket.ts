import { useEffect, useRef, useCallback, useState } from 'react';
import { updatePrice } from '../utils/mockDataGenerator';

interface WebSocketState {
    isConnected: boolean;
    currentPrice: number;
    priceChange: number;
    priceChangePercent: number;
    priceHistory: Array<{ timestamp: number; price: number }>;
}

interface UseWebSocketOptions {
    symbol?: string;
    initialPrice?: number;
    updateInterval?: number;
    historyLength?: number;
}

/**
 * Mock WebSocket hook for simulating real-time price updates
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
    const {
        initialPrice = 42520,
        updateInterval = 1000,
        historyLength = 100,
    } = options;

    const [state, setState] = useState<WebSocketState>({
        isConnected: true,
        currentPrice: initialPrice,
        priceChange: 0,
        priceChangePercent: 0,
        priceHistory: [{ timestamp: Date.now(), price: initialPrice }],
    });

    const priceRef = useRef(initialPrice);
    const basePrice = useRef(initialPrice);
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

    const connect = useCallback(() => {
        setState((prev) => ({ ...prev, isConnected: true }));
    }, []);

    const disconnect = useCallback(() => {
        setState((prev) => ({ ...prev, isConnected: false }));
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
            if (!state.isConnected) return;

            const newPrice = updatePrice(priceRef.current);
            const change = newPrice - basePrice.current;
            const changePercent = (change / basePrice.current) * 100;

            priceRef.current = newPrice;

            setState((prev) => ({
                ...prev,
                currentPrice: newPrice,
                priceChange: Math.round(change * 100) / 100,
                priceChangePercent: Math.round(changePercent * 100) / 100,
                priceHistory: [
                    ...prev.priceHistory.slice(-(historyLength - 1)),
                    { timestamp: Date.now(), price: newPrice },
                ],
            }));
        }, updateInterval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [state.isConnected, updateInterval, historyLength]);

    return {
        ...state,
        connect,
        disconnect,
    };
}

export default useWebSocket;
