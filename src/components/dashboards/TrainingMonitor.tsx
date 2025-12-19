import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Pause,
    Play,
    Square,
    Download,
    FileText,
    Activity,
    TrendingUp,
    Zap,
    Settings,
    ChevronRight,
    ChevronLeft,
    SkipBack,
    SkipForward,
    FastForward,
    Eye,
} from 'lucide-react';
import { useTrainingStore } from '../../stores/trainingStore';
import { useExperimentStore } from '../../stores/experimentStore';
import { useMockTrainingData } from '../../hooks/useMockTrainingData';
import { Button, Select, Slider, Checkbox, ButtonGroup } from '../shared/FormControls';
import { TrainingProgress, ProgressBar } from '../shared/ProgressBar';
import {
    LearningCurveChart,
    LossChart,
    EntropyChart,
    ActionDistributionChart,
    CandlestickChart,
    EquityCurveChart,
} from '../shared/Charts';
import { MetricCardGrid, StatusBadge } from '../shared/KPICards';
import {
    formatCurrency,
    formatPercent,
    formatRatio,
    formatLogTime,
    formatDurationShort,
    formatNumber,
} from '../../utils/formatters';
import { generateCandleSeries } from '../../utils/mockDataGenerator';
import type { CandleData } from '../../types/training';

// Replay Monitor Component
interface ReplaySnapshot {
    timestep: number;
    episode: number;
    priceData: CandleData[];
    equity: number;
    equityHistory: Array<{ date: string; equity: number; benchmark: number }>;
    trades: number;
    winRate: number;
    pnl: number;
}

function ReplayMonitor({ snapshots }: { snapshots: ReplaySnapshot[] }) {
    const [currentIndex, setCurrentIndex] = useState(snapshots.length - 1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(1);

    const current = snapshots[currentIndex] || snapshots[snapshots.length - 1];

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

    if (!current) {
        return (
            <div className="text-center py-8 text-dark-500">
                Waiting for training snapshots...
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
                    <span>Step 0</span>
                    <span className="font-medium text-primary-500">
                        Step {formatNumber(current.timestep)} (Episode {current.episode})
                    </span>
                    <span>Step {formatNumber(snapshots[snapshots.length - 1]?.timestep || 0)}</span>
                </div>
            </div>

            {/* Snapshot Stats */}
            <div className="grid grid-cols-4 gap-3">
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
            </div>

            {/* Candlestick Chart with Agent Actions */}
            <div>
                <h4 className="text-sm font-medium text-dark-900 dark:text-white mb-2 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary-500" />
                    Agent Actions at Step {formatNumber(current.timestep)}
                </h4>
                <CandlestickChart data={current.priceData} height={250} />
            </div>

            {/* Equity Curve */}
            <div>
                <h4 className="text-sm font-medium text-dark-900 dark:text-white mb-2">
                    Equity Progress
                </h4>
                <EquityCurveChart data={current.equityHistory} height={150} />
            </div>
        </div>
    );
}

// Right Sidebar Config Panel - Full Wizard Configuration
function ConfigSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
    const {
        features,
        model,
        hyperparameters,
        reward,
        environment,
        resources,
        deployment,
        updateDataSource,
        updateICTFeatures,
        updateModel,
        updateHyperparameters,
        updateReward,
        updateEnvironment,
        updateResources,
        updateDeployment,
        applyPreset,
    } = useExperimentStore();

    // Accordion state for each section
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        data: true,
        model: false,
        hyperparams: false,
        reward: false,
        environment: false,
        deploy: false,
    });

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (collapsed) {
        return (
            <div className="w-12 bg-white dark:bg-dark-800 border-l border-dark-200 dark:border-dark-700 flex flex-col items-center py-4">
                <button
                    onClick={onToggle}
                    className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
                >
                    <ChevronLeft className="w-5 h-5 text-dark-500" />
                </button>
                <div className="mt-4 flex flex-col gap-2 items-center">
                    <Settings className="w-5 h-5 text-dark-400" />
                </div>
            </div>
        );
    }

    const SectionHeader = ({
        title,
        section,
        icon: Icon
    }: {
        title: string;
        section: string;
        icon: React.ComponentType<{ className?: string }>
    }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between py-2 hover:bg-dark-50 dark:hover:bg-dark-900/50 rounded-lg px-2 -mx-2"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-primary-500" />
                <span className="text-sm font-medium text-dark-900 dark:text-white">{title}</span>
            </div>
            <ChevronRight className={`w-4 h-4 text-dark-400 transition-transform ${openSections[section] ? 'rotate-90' : ''}`} />
        </button>
    );

    return (
        <div className="w-96 bg-white dark:bg-dark-800 border-l border-dark-200 dark:border-dark-700 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-dark-200 dark:border-dark-700 flex items-center justify-between flex-shrink-0">
                <h3 className="font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Full Experiment Config
                </h3>
                <button
                    onClick={onToggle}
                    className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700"
                >
                    <ChevronRight className="w-4 h-4 text-dark-500" />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* 1. DATA & FEATURES */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Data & Features" section="data" icon={Activity} />
                    {openSections.data && (
                        <div className="mt-3 space-y-3">
                            <Select
                                label="Exchange"
                                value={features.dataSource.exchange}
                                onChange={(v) => updateDataSource({ exchange: v as 'binance' | 'coinbase' | 'kraken' | 'bybit' })}
                                options={[
                                    { value: 'binance', label: 'Binance' },
                                    { value: 'coinbase', label: 'Coinbase' },
                                    { value: 'kraken', label: 'Kraken' },
                                    { value: 'bybit', label: 'Bybit' },
                                ]}
                            />
                            <Select
                                label="Symbol"
                                value={features.dataSource.symbol}
                                onChange={(v) => updateDataSource({ symbol: v as 'BTCUSDT' | 'ETHUSDT' | 'BNBUSDT' | 'SOLUSDT' | 'XRPUSDT' })}
                                options={[
                                    { value: 'BTCUSDT', label: 'BTC/USDT' },
                                    { value: 'ETHUSDT', label: 'ETH/USDT' },
                                    { value: 'BNBUSDT', label: 'BNB/USDT' },
                                    { value: 'SOLUSDT', label: 'SOL/USDT' },
                                    { value: 'XRPUSDT', label: 'XRP/USDT' },
                                ]}
                            />
                            <Select
                                label="Timeframe"
                                value={features.dataSource.baseTimeframe}
                                onChange={(v) => updateDataSource({ baseTimeframe: v as '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' })}
                                options={[
                                    { value: '1m', label: '1 Minute' },
                                    { value: '5m', label: '5 Minutes' },
                                    { value: '15m', label: '15 Minutes' },
                                    { value: '1h', label: '1 Hour' },
                                    { value: '4h', label: '4 Hours' },
                                    { value: '1d', label: '1 Day' },
                                ]}
                            />
                            <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                                <p className="text-xs font-medium text-dark-500 mb-2">ICT Features</p>
                                <div className="space-y-1">
                                    <Checkbox
                                        label="Order Block"
                                        checked={features.ictFeatures.orderBlock}
                                        onChange={(v) => updateICTFeatures({ orderBlock: v })}
                                    />
                                    <Checkbox
                                        label="Fair Value Gap"
                                        checked={features.ictFeatures.fairValueGap}
                                        onChange={(v) => updateICTFeatures({ fairValueGap: v })}
                                    />
                                    <Checkbox
                                        label="Market Structure"
                                        checked={features.ictFeatures.marketStructure}
                                        onChange={(v) => updateICTFeatures({ marketStructure: v })}
                                    />
                                    <Checkbox
                                        label="Liquidity Pools"
                                        checked={features.ictFeatures.liquidityPools}
                                        onChange={(v) => updateICTFeatures({ liquidityPools: v })}
                                    />
                                    <Checkbox
                                        label="Institutional Flow"
                                        checked={features.ictFeatures.institutionalFlow}
                                        onChange={(v) => updateICTFeatures({ institutionalFlow: v })}
                                    />
                                </div>
                            </div>
                            <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                                <Checkbox
                                    label="Include On-Chain Data"
                                    checked={features.dataSource.includeOnChain}
                                    onChange={(v) => updateDataSource({ includeOnChain: v })}
                                />
                                <Checkbox
                                    label="Include Open Interest"
                                    checked={features.dataSource.includeOpenInterest}
                                    onChange={(v) => updateDataSource({ includeOpenInterest: v })}
                                />
                            </div>
                            <div className="text-xs text-primary-500 bg-primary-50 dark:bg-primary-900/20 p-2 rounded">
                                {features.totalFeatures} features | {features.estimatedMemory}
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. MODEL */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Model" section="model" icon={Zap} />
                    {openSections.model && (
                        <div className="mt-3 space-y-3">
                            <Select
                                label="Algorithm"
                                value={model.algorithm}
                                onChange={(v) => updateModel({ algorithm: v as 'PPO' | 'DQN' | 'A3C' | 'TRPO' | 'SAC' })}
                                options={[
                                    { value: 'PPO', label: 'PPO - Stable & Reliable' },
                                    { value: 'DQN', label: 'DQN - Discrete Actions' },
                                    { value: 'A3C', label: 'A3C - Distributed' },
                                    { value: 'TRPO', label: 'TRPO - Safe Updates' },
                                    { value: 'SAC', label: 'SAC - Sample Efficient' },
                                ]}
                            />
                            <Select
                                label="Architecture"
                                value={model.architecture}
                                onChange={(v) => updateModel({ architecture: v as 'Dense' | 'LSTM' | 'CNN' | 'Transformer' | 'Hybrid' })}
                                options={[
                                    { value: 'Dense', label: 'Dense - Fast training' },
                                    { value: 'LSTM', label: 'LSTM - Sequential' },
                                    { value: 'CNN', label: 'CNN - Pattern detection' },
                                    { value: 'Transformer', label: 'Transformer - Expensive' },
                                    { value: 'Hybrid', label: 'Hybrid - Best of both' },
                                ]}
                            />
                            <Slider
                                label="Hidden Size"
                                value={model.hiddenSize}
                                min={64}
                                max={1024}
                                step={64}
                                onChange={(v) => updateModel({ hiddenSize: v })}
                                formatValue={(v) => `${v} units`}
                            />
                            <Slider
                                label="Layers"
                                value={model.numLayers}
                                min={1}
                                max={6}
                                step={1}
                                onChange={(v) => updateModel({ numLayers: v })}
                                formatValue={(v) => `${v}`}
                            />
                            <div className="pt-2">
                                <p className="text-xs font-medium text-dark-500 mb-2">Value Function</p>
                                <ButtonGroup
                                    options={[
                                        { value: 'shared', label: 'Shared' },
                                        { value: 'separate', label: 'Separate' },
                                    ]}
                                    value={model.valueFunction}
                                    onChange={(v) => updateModel({ valueFunction: v as 'shared' | 'separate' })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. HYPERPARAMETERS */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Hyperparameters" section="hyperparams" icon={TrendingUp} />
                    {openSections.hyperparams && (
                        <div className="mt-3 space-y-3">
                            <div className="flex gap-1 mb-3">
                                {(['aggressive', 'balanced', 'conservative'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => applyPreset(p)}
                                        className={`flex-1 text-xs px-2 py-1.5 rounded ${model.preset === p
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-dark-100 dark:bg-dark-700 text-dark-500 hover:bg-dark-200 dark:hover:bg-dark-600'
                                            }`}
                                    >
                                        {p.charAt(0).toUpperCase() + p.slice(1, 3)}
                                    </button>
                                ))}
                            </div>
                            <Slider
                                label="Learning Rate"
                                value={hyperparameters.learningRate}
                                min={0.00001}
                                max={0.01}
                                step={0.00001}
                                onChange={(v) => updateHyperparameters({ learningRate: v })}
                                formatValue={(v) => v.toExponential(1)}
                            />
                            <Slider
                                label="Entropy Coef"
                                value={hyperparameters.entropyCoefficient}
                                min={0}
                                max={0.1}
                                step={0.001}
                                onChange={(v) => updateHyperparameters({ entropyCoefficient: v })}
                                formatValue={(v) => v.toFixed(3)}
                            />
                            <Slider
                                label="Discount (γ)"
                                value={hyperparameters.discountFactor}
                                min={0.9}
                                max={0.999}
                                step={0.001}
                                onChange={(v) => updateHyperparameters({ discountFactor: v })}
                                formatValue={(v) => v.toFixed(3)}
                            />
                            <Slider
                                label="GAE Lambda"
                                value={hyperparameters.gaeLambda}
                                min={0.9}
                                max={1}
                                step={0.01}
                                onChange={(v) => updateHyperparameters({ gaeLambda: v })}
                                formatValue={(v) => v.toFixed(2)}
                            />
                            <Slider
                                label="Clip Ratio"
                                value={hyperparameters.clipRatio}
                                min={0.1}
                                max={0.3}
                                step={0.01}
                                onChange={(v) => updateHyperparameters({ clipRatio: v })}
                                formatValue={(v) => v.toFixed(2)}
                            />
                            <Slider
                                label="Total Steps"
                                value={hyperparameters.totalTimesteps}
                                min={100000}
                                max={5000000}
                                step={100000}
                                onChange={(v) => updateHyperparameters({ totalTimesteps: v })}
                                formatValue={(v) => `${(v / 1000000).toFixed(1)}M`}
                            />
                            <Slider
                                label="Batch Size"
                                value={hyperparameters.batchSize}
                                min={32}
                                max={512}
                                step={32}
                                onChange={(v) => updateHyperparameters({ batchSize: v })}
                                formatValue={(v) => `${v}`}
                            />
                            <Slider
                                label="Epochs/Update"
                                value={hyperparameters.epochsPerUpdate}
                                min={1}
                                max={20}
                                step={1}
                                onChange={(v) => updateHyperparameters({ epochsPerUpdate: v })}
                                formatValue={(v) => `${v}`}
                            />
                        </div>
                    )}
                </div>

                {/* 4. REWARD */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Reward Function" section="reward" icon={Activity} />
                    {openSections.reward && (
                        <div className="mt-3 space-y-3">
                            <Select
                                label="Reward Type"
                                value={reward.type}
                                onChange={(v) => updateReward({ type: v as 'pure_pnl' | 'sharpe_based' | 'sortino_based' | 'custom_weighted' })}
                                options={[
                                    { value: 'pure_pnl', label: 'Pure P&L' },
                                    { value: 'sharpe_based', label: 'Sharpe-Based' },
                                    { value: 'sortino_based', label: 'Sortino-Based' },
                                    { value: 'custom_weighted', label: 'Custom Weighted' },
                                ]}
                            />
                            <Slider
                                label="P&L Weight"
                                value={reward.pnlWeight}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => updateReward({ pnlWeight: v })}
                                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                            />
                            <Slider
                                label="Sharpe Weight"
                                value={reward.sharpeWeight}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={(v) => updateReward({ sharpeWeight: v })}
                                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                            />
                            <Slider
                                label="Turnover Penalty"
                                value={reward.turnoverPenalty}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => updateReward({ turnoverPenalty: v })}
                                formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                            />
                            <Checkbox
                                label="Reward Clipping [-10, 10]"
                                checked={reward.rewardClipping}
                                onChange={(v) => updateReward({ rewardClipping: v })}
                            />
                        </div>
                    )}
                </div>

                {/* 5. ENVIRONMENT */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Environment" section="environment" icon={Settings} />
                    {openSections.environment && (
                        <div className="mt-3 space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-dark-500">Capital:</span>
                                    <span className="ml-1 font-medium">{formatCurrency(environment.startingCapital)}</span>
                                </div>
                                <div>
                                    <span className="text-dark-500">Max Pos:</span>
                                    <span className="ml-1 font-medium">{environment.maxPositionSize}%</span>
                                </div>
                            </div>
                            <Slider
                                label="Max Position Size"
                                value={environment.maxPositionSize}
                                min={1}
                                max={100}
                                step={1}
                                onChange={(v) => updateEnvironment({ maxPositionSize: v })}
                                formatValue={(v) => `${v}%`}
                            />
                            <Slider
                                label="Slippage"
                                value={environment.slippage}
                                min={0}
                                max={0.5}
                                step={0.01}
                                onChange={(v) => updateEnvironment({ slippage: v })}
                                formatValue={(v) => `${(v * 100).toFixed(2)}%`}
                            />
                            <Slider
                                label="Taker Fee"
                                value={environment.takerFee}
                                min={0}
                                max={0.2}
                                step={0.01}
                                onChange={(v) => updateEnvironment({ takerFee: v })}
                                formatValue={(v) => `${(v * 100).toFixed(2)}%`}
                            />
                            <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                                <Checkbox
                                    label="Normalize Observations"
                                    checked={environment.normalizeObservations}
                                    onChange={(v) => updateEnvironment({ normalizeObservations: v })}
                                />
                                <Checkbox
                                    label="Running Normalization"
                                    checked={environment.runningNormalization}
                                    onChange={(v) => updateEnvironment({ runningNormalization: v })}
                                />
                                <Checkbox
                                    label="Reward Normalization"
                                    checked={environment.rewardNormalization}
                                    onChange={(v) => updateEnvironment({ rewardNormalization: v })}
                                />
                            </div>
                            <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                                <p className="text-xs font-medium text-dark-500 mb-2">Compute</p>
                                <Select
                                    label="GPU"
                                    value={resources.compute}
                                    onChange={(v) => updateResources({ compute: v as 'H100' | 'A100' | 'L40S' | 'CPU' })}
                                    options={[
                                        { value: 'H100', label: 'H100' },
                                        { value: 'A100', label: 'A100' },
                                        { value: 'L40S', label: 'L40S' },
                                        { value: 'CPU', label: 'CPU' },
                                    ]}
                                />
                                <Slider
                                    label="Num Envs"
                                    value={resources.numEnvs}
                                    min={1}
                                    max={32}
                                    step={1}
                                    onChange={(v) => updateResources({ numEnvs: v })}
                                    formatValue={(v) => `${v}`}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* 6. DEPLOYMENT */}
                <div className="border border-dark-200 dark:border-dark-700 rounded-lg p-3">
                    <SectionHeader title="Deployment" section="deploy" icon={TrendingUp} />
                    {openSections.deploy && (
                        <div className="mt-3 space-y-3">
                            <Select
                                label="Target"
                                value={deployment.target}
                                onChange={(v) => updateDeployment({ target: v as 'paper_testnet' | 'paper_simulated' | 'live_spot' | 'live_futures' })}
                                options={[
                                    { value: 'paper_testnet', label: 'Paper (Testnet)' },
                                    { value: 'paper_simulated', label: 'Paper (Simulated)' },
                                    { value: 'live_spot', label: 'Live (Spot)' },
                                    { value: 'live_futures', label: 'Live (Futures)' },
                                ]}
                            />
                            <Slider
                                label="Position Size"
                                value={deployment.positionSize}
                                min={1}
                                max={20}
                                step={1}
                                onChange={(v) => updateDeployment({ positionSize: v })}
                                formatValue={(v) => `${v}%`}
                            />
                            <Slider
                                label="Max Daily Loss"
                                value={deployment.maxDailyLoss}
                                min={1}
                                max={20}
                                step={1}
                                onChange={(v) => updateDeployment({ maxDailyLoss: v })}
                                formatValue={(v) => `${v}%`}
                            />
                            <Slider
                                label="Max Drawdown"
                                value={deployment.maxDrawdown}
                                min={5}
                                max={50}
                                step={1}
                                onChange={(v) => updateDeployment({ maxDrawdown: v })}
                                formatValue={(v) => `${v}%`}
                            />
                            <div className="pt-2 border-t border-dark-200 dark:border-dark-700">
                                <Checkbox
                                    label="Real-Time Monitoring"
                                    checked={deployment.realTimeMonitoring}
                                    onChange={(v) => updateDeployment({ realTimeMonitoring: v })}
                                />
                                <Checkbox
                                    label="Emergency Stop"
                                    checked={deployment.emergencyStop}
                                    onChange={(v) => updateDeployment({ emergencyStop: v })}
                                />
                                <Checkbox
                                    label="Auto Retraining"
                                    checked={deployment.autoRetraining}
                                    onChange={(v) => updateDeployment({ autoRetraining: v })}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Generate mock replay snapshots
function generateReplaySnapshots(stepCount: number): ReplaySnapshot[] {
    const snapshots: ReplaySnapshot[] = [];
    const snapshotInterval = 10000; // Every 10k steps
    let equity = 10000;

    for (let step = 0; step <= stepCount; step += snapshotInterval) {
        const episode = Math.floor(step / 2048);
        const improvement = Math.log(episode + 1) / Math.log(200);
        const pnlChange = (improvement * 500) + (Math.random() - 0.4) * 200;
        equity += pnlChange;

        const priceData = generateCandleSeries(60, 42000 + Math.random() * 1000)
            .map((candle, i) => ({
                ...candle,
                agentAction: i % 12 === 0 ? 'long' as const : i % 18 === 0 ? 'short' as const : undefined,
                tradeEntry: i % 12 === 0,
                tradeExit: i % 15 === 0,
            }));

        const equityHistory = [];
        for (let d = 0; d <= Math.floor(step / snapshotInterval); d++) {
            const histEquity = 10000 + (d / Math.floor(stepCount / snapshotInterval)) * (equity - 10000);
            const benchmark = 10000 + (d / Math.floor(stepCount / snapshotInterval)) * 2000;
            equityHistory.push({
                date: new Date(Date.now() - (Math.floor(stepCount / snapshotInterval) - d) * 86400000).toISOString().split('T')[0],
                equity: histEquity,
                benchmark,
            });
        }

        snapshots.push({
            timestep: step,
            episode,
            priceData,
            equity,
            equityHistory,
            trades: Math.floor(episode * 1.5),
            winRate: 50 + improvement * 15 + (Math.random() - 0.5) * 5,
            pnl: equity - 10000,
        });
    }

    return snapshots;
}

export function TrainingMonitor() {
    const {
        experimentName,
        status,
        progress,
        learningCurve,
        actionStats,
        stateHealth,
        tradePerformance,
        currentEpisode,
        logs,
        pauseTraining,
        resumeTraining,
        stopTraining,
    } = useTrainingStore();

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [replaySnapshots, setReplaySnapshots] = useState<ReplaySnapshot[]>([]);

    // Start mock data updates
    useMockTrainingData({ autoStart: true, updateInterval: 1500 });

    // Generate replay snapshots based on progress
    useEffect(() => {
        setReplaySnapshots(generateReplaySnapshots(progress.currentStep));
    }, [progress.currentStep]);

    const isRunning = status === 'running';
    const isPaused = status === 'paused';

    return (
        <div className="flex h-[calc(100vh-7rem)] -m-6">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Header Controls */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-dark-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-6 h-6 text-primary-500" />
                            {experimentName}
                        </h2>
                        <p className="text-dark-500 mt-1">
                            Status: <StatusBadge status={isRunning ? 'training' : isPaused ? 'warning' : 'completed'} label={status.toUpperCase()} size="sm" />
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isRunning ? (
                            <Button onClick={pauseTraining} variant="secondary" icon={<Pause className="w-4 h-4" />}>
                                Pause
                            </Button>
                        ) : isPaused ? (
                            <Button onClick={resumeTraining} variant="primary" icon={<Play className="w-4 h-4" />}>
                                Resume
                            </Button>
                        ) : null}

                        {(isRunning || isPaused) && (
                            <Button onClick={stopTraining} variant="danger" icon={<Square className="w-4 h-4" />}>
                                Stop
                            </Button>
                        )}

                        <Button variant="ghost" icon={<Download className="w-4 h-4" />}>
                            Checkpoint
                        </Button>
                    </div>
                </div>

                {/* Training Progress */}
                <TrainingProgress {...progress} />

                {/* Replay Monitor */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-primary-500" />
                        Training Replay Monitor
                        <span className="text-xs text-dark-500 ml-2">
                            (Snapshots every 10K steps)
                        </span>
                    </h3>
                    <ReplayMonitor snapshots={replaySnapshots} />
                </div>

                {/* Learning Curves Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary-500" />
                            Episodic Return
                        </h3>
                        <LearningCurveChart data={learningCurve} height={200} />
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                            Policy Loss
                        </h3>
                        <LossChart data={learningCurve} type="policy" height={200} />
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                            Value Loss
                        </h3>
                        <LossChart data={learningCurve} type="value" height={200} />
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-warning-500" />
                            Entropy & KL Divergence
                        </h3>
                        <EntropyChart data={learningCurve} height={200} />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                            Action Distribution
                        </h3>
                        <ActionDistributionChart
                            longFrequency={actionStats.longFrequency}
                            flatFrequency={actionStats.flatFrequency}
                            shortFrequency={actionStats.shortFrequency}
                            height={150}
                        />
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-dark-500">Avg Hold Time</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {formatDurationShort(actionStats.avgHoldTime * 3600)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-dark-500">Exploration</span>
                                <span className="font-medium text-dark-900 dark:text-white">
                                    {actionStats.explorationEntropy.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                            State Diagnostics
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-500">Mean Centered</span>
                                <span className={`text-sm font-medium ${stateHealth.meanCentered ? 'text-success-500' : 'text-error-500'}`}>
                                    {stateHealth.meanCentered ? '✓' : '✗'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-500">Unit Variance</span>
                                <span className={`text-sm font-medium ${stateHealth.unitVariance ? 'text-success-500' : 'text-error-500'}`}>
                                    {stateHealth.unitVariance ? '✓' : '✗'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-dark-500">NaN Count</span>
                                <span className={`text-sm font-medium ${stateHealth.nanCount === 0 ? 'text-success-500' : 'text-error-500'}`}>
                                    {stateHealth.nanCount}
                                </span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-dark-500">Feature Coverage</span>
                                    <span className="text-dark-900 dark:text-white">{stateHealth.obsCoverage}%</span>
                                </div>
                                <ProgressBar progress={stateHealth.obsCoverage} size="sm" showLabel={false} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                        <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4">
                            Trade Performance
                        </h3>
                        <MetricCardGrid
                            columns={2}
                            metrics={[
                                { label: 'Win Rate', value: formatPercent(tradePerformance.winRate, 0, false) },
                                { label: 'Avg P&L', value: formatCurrency(tradePerformance.avgPnL) },
                                { label: 'Max DD', value: formatPercent(-tradePerformance.maxDrawdown) },
                                { label: 'Sharpe', value: formatRatio(tradePerformance.sharpeRatio) },
                            ]}
                        />
                        <div className="mt-4 p-3 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-dark-500">Cumulative P&L</span>
                                <span className={`font-bold ${tradePerformance.cumulativePnL > 0 ? 'text-success-500' : 'text-error-500'}`}>
                                    {formatCurrency(tradePerformance.cumulativePnL)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logs Panel */}
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4">
                    <h3 className="text-sm font-medium text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-dark-500" />
                        Training Logs
                    </h3>
                    <div className="bg-dark-900 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-xs">
                        {logs.map((log) => (
                            <div key={log.id} className="flex gap-3 py-1 hover:bg-dark-800">
                                <span className="text-dark-500 flex-shrink-0">
                                    {formatLogTime(log.timestamp)}
                                </span>
                                <span className={`flex-shrink-0 ${log.level === 'ERROR' ? 'text-error-400' :
                                    log.level === 'WARN' ? 'text-warning-400' :
                                        log.level === 'DEBUG' ? 'text-dark-500' :
                                            'text-primary-400'
                                    }`}>
                                    [{log.level}]
                                </span>
                                <span className="text-dark-100">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Config Panel */}
            <ConfigSidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
        </div>
    );
}

export default TrainingMonitor;
