import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRight,
    Rocket,
    Database,
    Cpu,
    SlidersHorizontal,
    Award,
    Server,
    Play,
} from 'lucide-react';
import { useExperimentStore } from '../../stores/experimentStore';
import { Button, Select, Checkbox, Slider, Input, DatePicker, ButtonGroup } from '../shared/FormControls';
import { StepProgress } from '../shared/ProgressBar';

const steps = [
    { id: 1, label: 'Data & Features', icon: Database },
    { id: 2, label: 'Model', icon: Cpu },
    { id: 3, label: 'Hyperparameters', icon: SlidersHorizontal },
    { id: 4, label: 'Reward', icon: Award },
    { id: 5, label: 'Environment', icon: Server },
    { id: 6, label: 'Launch', icon: Rocket },
];

// Step 1: Feature Selection
function Step1Features() {
    const { features, updateDataSource, updateICTFeatures, addTimeframe, removeTimeframe, updateTimeframe } = useExperimentStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Data Source Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    label="Base Timeframe"
                    value={features.dataSource.baseTimeframe}
                    onChange={(v) => updateDataSource({ baseTimeframe: v as '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' })}
                    options={[
                        { value: '1m', label: '1 Minute' },
                        { value: '5m', label: '5 Minutes' },
                        { value: '15m', label: '15 Minutes' },
                        { value: '30m', label: '30 Minutes' },
                        { value: '1h', label: '1 Hour' },
                        { value: '4h', label: '4 Hours' },
                        { value: '1d', label: '1 Day' },
                    ]}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <DatePicker
                    label="Start Date"
                    value={features.dataSource.startDate}
                    onChange={(v) => updateDataSource({ startDate: v })}
                />
                <DatePicker
                    label="End Date"
                    value={features.dataSource.endDate}
                    onChange={(v) => updateDataSource({ endDate: v })}
                />
            </div>

            <div className="flex gap-6">
                <Checkbox
                    label="Include On-Chain Data"
                    checked={features.dataSource.includeOnChain}
                    onChange={(v) => updateDataSource({ includeOnChain: v })}
                    description="Add blockchain metrics to feature set"
                />
                <Checkbox
                    label="Include Open Interest"
                    checked={features.dataSource.includeOpenInterest}
                    onChange={(v) => updateDataSource({ includeOpenInterest: v })}
                    description="Add futures OI data"
                />
            </div>

            <hr className="border-dark-200 dark:border-dark-700" />

            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">ICT Pattern Features</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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

            <hr className="border-dark-200 dark:border-dark-700" />

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Timeframe Configuration</h3>
                <Button onClick={addTimeframe} variant="secondary" size="sm">
                    + Add Timeframe
                </Button>
            </div>

            <div className="space-y-4">
                {features.timeframes.map((tf, index) => (
                    <div key={tf.id} className="p-4 bg-dark-50 dark:bg-dark-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-medium text-dark-900 dark:text-white">Timeframe {index + 1}</span>
                            {features.timeframes.length > 1 && (
                                <Button
                                    onClick={() => removeTimeframe(tf.id)}
                                    variant="ghost"
                                    size="sm"
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <Select
                                label="Timeframe"
                                value={tf.timeframe}
                                onChange={(v) => updateTimeframe(tf.id, { timeframe: v as '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' })}
                                options={[
                                    { value: '1m', label: '1 Minute' },
                                    { value: '5m', label: '5 Minutes' },
                                    { value: '15m', label: '15 Minutes' },
                                    { value: '1h', label: '1 Hour' },
                                    { value: '4h', label: '4 Hours' },
                                    { value: '1d', label: '1 Day' },
                                ]}
                            />
                            <Slider
                                label="Lookback Period"
                                value={tf.lookback}
                                min={24}
                                max={1000}
                                step={1}
                                onChange={(v) => updateTimeframe(tf.id, { lookback: v })}
                                formatValue={(v) => `${v} bars`}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {tf.indicators.map((ind) => (
                                <Checkbox
                                    key={ind.id}
                                    label={ind.name}
                                    checked={ind.enabled}
                                    onChange={(v) => updateTimeframe(tf.id, {
                                        indicators: tf.indicators.map(i => i.id === ind.id ? { ...i, enabled: v } : i)
                                    })}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <p className="text-sm text-primary-700 dark:text-primary-300">
                    <strong>Feature Summary:</strong> {features.totalFeatures} total features | Est. memory: {features.estimatedMemory}
                </p>
            </div>
        </div>
    );
}

// Step 2: Model Configuration
function Step2Model() {
    const { model, updateModel } = useExperimentStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Algorithm Selection</h3>

            <div className="grid grid-cols-5 gap-4">
                {(['PPO', 'DQN', 'A3C', 'TRPO', 'SAC'] as const).map((algo) => (
                    <button
                        key={algo}
                        onClick={() => updateModel({ algorithm: algo })}
                        className={`p-4 rounded-xl border-2 transition-all ${model.algorithm === algo
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <div className="text-center">
                            <p className="font-bold text-dark-900 dark:text-white">{algo}</p>
                            <p className="text-xs text-dark-500 mt-1">
                                {algo === 'PPO' && 'Stable & Reliable'}
                                {algo === 'DQN' && 'Discrete Actions'}
                                {algo === 'A3C' && 'Distributed'}
                                {algo === 'TRPO' && 'Safe Updates'}
                                {algo === 'SAC' && 'Sample Efficient'}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mt-8">Network Architecture</h3>

            <div className="grid grid-cols-5 gap-4">
                {(['Dense', 'LSTM', 'CNN', 'Transformer', 'Hybrid'] as const).map((arch) => (
                    <button
                        key={arch}
                        onClick={() => updateModel({ architecture: arch })}
                        className={`p-4 rounded-xl border-2 transition-all ${model.architecture === arch
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <div className="text-center">
                            <p className="font-bold text-dark-900 dark:text-white">{arch}</p>
                            <p className={`text-xs mt-1 ${arch === 'Transformer' ? 'text-warning-500' : 'text-dark-500'
                                }`}>
                                {arch === 'Dense' && 'Fast training'}
                                {arch === 'LSTM' && 'Sequential'}
                                {arch === 'CNN' && 'Pattern detection'}
                                {arch === 'Transformer' && 'Expensive'}
                                {arch === 'Hybrid' && 'Best of both'}
                            </p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
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
                    label="Number of Layers"
                    value={model.numLayers}
                    min={1}
                    max={6}
                    step={1}
                    onChange={(v) => updateModel({ numLayers: v })}
                    formatValue={(v) => `${v} layers`}
                />
            </div>

            <div className="mt-6">
                <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-3">Value Function Type</p>
                <ButtonGroup
                    options={[
                        { value: 'shared', label: 'Shared Network' },
                        { value: 'separate', label: 'Separate Networks' },
                    ]}
                    value={model.valueFunction}
                    onChange={(v) => updateModel({ valueFunction: v as 'shared' | 'separate' })}
                />
            </div>
        </div>
    );
}

// Step 3: Hyperparameters
function Step3Hyperparameters() {
    const { hyperparameters, updateHyperparameters, applyPreset, model } = useExperimentStore();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Hyperparameter Tuning</h3>
                <div className="flex gap-2">
                    {(['aggressive', 'balanced', 'conservative'] as const).map((preset) => (
                        <Button
                            key={preset}
                            variant={model.preset === preset ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => applyPreset(preset)}
                        >
                            {preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Slider
                    label="Learning Rate"
                    value={hyperparameters.learningRate}
                    min={0.00001}
                    max={0.01}
                    step={0.00001}
                    onChange={(v) => updateHyperparameters({ learningRate: v })}
                    formatValue={(v) => v.toExponential(1)}
                    tooltip="Rate at which the model updates its weights"
                />
                <Slider
                    label="Entropy Coefficient"
                    value={hyperparameters.entropyCoefficient}
                    min={0}
                    max={0.1}
                    step={0.001}
                    onChange={(v) => updateHyperparameters({ entropyCoefficient: v })}
                    formatValue={(v) => v.toFixed(3)}
                    tooltip="Encourages exploration"
                />
                <Slider
                    label="Discount Factor (γ)"
                    value={hyperparameters.discountFactor}
                    min={0.9}
                    max={0.999}
                    step={0.001}
                    onChange={(v) => updateHyperparameters({ discountFactor: v })}
                    formatValue={(v) => v.toFixed(3)}
                    tooltip="Weight of future rewards"
                />
                <Slider
                    label="GAE Lambda (λ)"
                    value={hyperparameters.gaeLambda}
                    min={0.9}
                    max={1}
                    step={0.01}
                    onChange={(v) => updateHyperparameters({ gaeLambda: v })}
                    formatValue={(v) => v.toFixed(2)}
                    tooltip="Generalized Advantage Estimation parameter"
                />
                <Slider
                    label="Clip Ratio (ε)"
                    value={hyperparameters.clipRatio}
                    min={0.1}
                    max={0.3}
                    step={0.01}
                    onChange={(v) => updateHyperparameters({ clipRatio: v })}
                    formatValue={(v) => v.toFixed(2)}
                    tooltip="PPO clipping parameter"
                />
                <Slider
                    label="Total Timesteps"
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
                    label="Epochs Per Update"
                    value={hyperparameters.epochsPerUpdate}
                    min={1}
                    max={20}
                    step={1}
                    onChange={(v) => updateHyperparameters({ epochsPerUpdate: v })}
                    formatValue={(v) => `${v}`}
                />
            </div>
        </div>
    );
}

// Step 4: Reward Function
function Step4Reward() {
    const { reward, updateReward } = useExperimentStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Reward Function Design</h3>

            <div className="grid grid-cols-4 gap-4">
                {([
                    { value: 'pure_pnl', label: 'Pure P&L', desc: 'Simple profit-based' },
                    { value: 'sharpe_based', label: 'Sharpe-Based', desc: 'Risk-adjusted' },
                    { value: 'sortino_based', label: 'Sortino-Based', desc: 'Downside focus' },
                    { value: 'custom_weighted', label: 'Custom', desc: 'Configurable' },
                ] as const).map((type) => (
                    <button
                        key={type.value}
                        onClick={() => updateReward({ type: type.value })}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${reward.type === type.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <p className="font-bold text-dark-900 dark:text-white">{type.label}</p>
                        <p className="text-xs text-dark-500 mt-1">{type.desc}</p>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
            </div>

            <div className="mt-6">
                <Checkbox
                    label="Enable Reward Clipping"
                    checked={reward.rewardClipping}
                    onChange={(v) => updateReward({ rewardClipping: v })}
                    description="Clip rewards to [-10, 10] range for stability"
                />
            </div>
        </div>
    );
}

// Step 5: Environment & Resources
function Step5Environment() {
    const { environment, resources, updateEnvironment, updateResources } = useExperimentStore();

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Trading Environment</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                    label="Starting Capital"
                    value={environment.startingCapital}
                    onChange={(v) => updateEnvironment({ startingCapital: parseFloat(v) || 0 })}
                    type="number"
                    suffix="USDT"
                />
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
                    label="Max Simultaneous Positions"
                    value={environment.maxSimultaneousPositions}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(v) => updateEnvironment({ maxSimultaneousPositions: v })}
                    formatValue={(v) => `${v}`}
                />
            </div>

            <div className="grid grid-cols-2 gap-6">
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
            </div>

            <div className="flex flex-wrap gap-6">
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

            <hr className="border-dark-200 dark:border-dark-700 my-8" />

            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Compute Resources</h3>

            <div className="grid grid-cols-4 gap-4">
                {(['H100', 'A100', 'L40S', 'CPU'] as const).map((compute) => (
                    <button
                        key={compute}
                        onClick={() => updateResources({ compute })}
                        className={`p-4 rounded-xl border-2 transition-all ${resources.compute === compute
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-dark-200 dark:border-dark-700 hover:border-primary-300'
                            }`}
                    >
                        <p className="font-bold text-dark-900 dark:text-white">{compute}</p>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
                <Select
                    label="Environment"
                    value={resources.environment}
                    onChange={(v) => updateResources({ environment: v as 'local' | 'aws' | 'gcp' })}
                    options={[
                        { value: 'local', label: 'Local' },
                        { value: 'aws', label: 'AWS' },
                        { value: 'gcp', label: 'Google Cloud' },
                    ]}
                />
                <Slider
                    label="Number of Environments"
                    value={resources.numEnvs}
                    min={1}
                    max={32}
                    step={1}
                    onChange={(v) => updateResources({ numEnvs: v })}
                    formatValue={(v) => `${v}`}
                />
            </div>

            <div className="flex gap-6">
                <Checkbox
                    label="Multi-Environment Training"
                    checked={resources.multiEnvironment}
                    onChange={(v) => updateResources({ multiEnvironment: v })}
                />
                <Checkbox
                    label="Distributed Training"
                    checked={resources.distributedTraining}
                    onChange={(v) => updateResources({ distributedTraining: v })}
                />
            </div>
        </div>
    );
}

// Step 6: Launch & Deploy
function Step6Launch() {
    const { deployment, updateDeployment, getExperimentConfig, experimentName, setExperimentName } = useExperimentStore();
    const navigate = useNavigate();

    const handleLaunch = () => {
        // In a real app, this would start the training
        console.log('Launching experiment:', getExperimentConfig());
        navigate('/training');
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Experiment Name & Description</h3>

            <div className="grid grid-cols-2 gap-6">
                <Input
                    label="Experiment Name"
                    value={experimentName}
                    onChange={(v) => setExperimentName(v)}
                />
                <Select
                    label="Deployment Target"
                    value={deployment.target}
                    onChange={(v) => updateDeployment({ target: v as 'paper_testnet' | 'paper_simulated' | 'live_spot' | 'live_futures' })}
                    options={[
                        { value: 'paper_testnet', label: 'Paper Trading (Testnet)' },
                        { value: 'paper_simulated', label: 'Paper Trading (Simulated)' },
                        { value: 'live_spot', label: 'Live Trading (Spot)' },
                        { value: 'live_futures', label: 'Live Trading (Futures)' },
                    ]}
                />
            </div>

            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mt-8">Risk Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            </div>

            <div className="flex flex-wrap gap-6">
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

            <div className="mt-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
                <h4 className="text-lg font-bold mb-2">Ready to Launch!</h4>
                <p className="text-sm text-primary-100 mb-4">
                    Your experiment is configured and ready. Click "Start Training" to begin the training process.
                </p>
                <Button
                    onClick={handleLaunch}
                    variant="secondary"
                    size="lg"
                    icon={<Play className="w-5 h-5" />}
                    className="bg-white text-primary-600 hover:bg-primary-50"
                >
                    Start Training
                </Button>
            </div>
        </div>
    );
}

export function ExperimentWizard() {
    const { currentStep, setCurrentStep, resetWizard } = useExperimentStore();

    const stepComponents = [Step1Features, Step2Model, Step3Hyperparameters, Step4Reward, Step5Environment, Step6Launch];
    const CurrentStepComponent = stepComponents[currentStep - 1];

    return (
        <div className="flex gap-6">
            {/* Sidebar Stepper */}
            <div className="w-64 flex-shrink-0">
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-4 sticky top-24">
                    <StepProgress
                        steps={steps.map((s, i) => ({
                            label: s.label,
                            completed: i + 1 < currentStep,
                            current: i + 1 === currentStep,
                        }))}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-6">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CurrentStepComponent />
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-200 dark:border-dark-700">
                        <div>
                            {currentStep > 1 && (
                                <Button
                                    onClick={() => setCurrentStep(currentStep - 1)}
                                    variant="ghost"
                                    icon={<ArrowLeft className="w-4 h-4" />}
                                >
                                    Previous
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={resetWizard} variant="ghost">
                                Reset
                            </Button>
                            {currentStep < 6 && (
                                <Button
                                    onClick={() => setCurrentStep(currentStep + 1)}
                                    icon={<ArrowRight className="w-4 h-4" />}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExperimentWizard;
