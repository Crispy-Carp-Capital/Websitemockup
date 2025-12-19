// Experiment Types

export type Exchange = 'binance' | 'coinbase' | 'kraken' | 'bybit';

export type Symbol = 'BTCUSDT' | 'ETHUSDT' | 'BNBUSDT' | 'SOLUSDT' | 'XRPUSDT';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

export type Algorithm = 'PPO' | 'DQN' | 'A3C' | 'TRPO' | 'SAC';

export type Architecture = 'Dense' | 'LSTM' | 'CNN' | 'Transformer' | 'Hybrid';

export type ValueFunction = 'shared' | 'separate';

export type PresetType = 'aggressive' | 'balanced' | 'conservative';

export type RewardFunction = 'pure_pnl' | 'sharpe_based' | 'sortino_based' | 'custom_weighted';

export type ExperimentStatus = 'draft' | 'training' | 'completed' | 'failed' | 'deployed';

export interface Indicator {
    id: string;
    name: string;
    category: 'momentum' | 'trend' | 'volatility' | 'volume';
    enabled: boolean;
}

export interface TimeframeConfig {
    id: string;
    timeframe: Timeframe;
    lookback: number;
    indicators: Indicator[];
}

export interface ICTFeatures {
    orderBlock: boolean;
    fairValueGap: boolean;
    marketStructure: boolean;
    liquidityPools: boolean;
    institutionalFlow: boolean;
}

export interface DataSourceConfig {
    exchange: Exchange;
    symbol: Symbol;
    baseTimeframe: Timeframe;
    startDate: string;
    endDate: string;
    includeOnChain: boolean;
    includeOpenInterest: boolean;
}

export interface FeatureConfig {
    dataSource: DataSourceConfig;
    timeframes: TimeframeConfig[];
    ictFeatures: ICTFeatures;
    totalFeatures: number;
    estimatedMemory: string;
}

export interface ModelConfig {
    algorithm: Algorithm;
    architecture: Architecture;
    valueFunction: ValueFunction;
    preset: PresetType;
    hiddenSize: number;
    numLayers: number;
}

export interface HyperparametersConfig {
    learningRate: number;
    entropyCoefficient: number;
    discountFactor: number;
    gaeLambda: number;
    clipRatio: number;
    totalTimesteps: number;
    rolloutBufferSize: number;
    batchSize: number;
    epochsPerUpdate: number;
    updateFrequency: number;
}

export interface RewardConfig {
    type: RewardFunction;
    pnlWeight: number;
    sharpeWeight: number;
    turnoverPenalty: number;
    rewardClipping: boolean;
}

export interface EnvironmentConfig {
    normalizeObservations: boolean;
    runningNormalization: boolean;
    rewardNormalization: boolean;
    startingCapital: number;
    maxPositionSize: number;
    maxSimultaneousPositions: number;
    slippage: number;
    takerFee: number;
}

export interface ResourceConfig {
    compute: 'H100' | 'A100' | 'L40S' | 'CPU';
    environment: 'local' | 'aws' | 'gcp';
    multiEnvironment: boolean;
    distributedTraining: boolean;
    numEnvs: number;
}

export interface DeploymentConfig {
    target: 'paper_testnet' | 'paper_simulated' | 'live_spot' | 'live_futures';
    exchange: Exchange;
    positionSize: number;
    maxSimultaneousTrades: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    realTimeMonitoring: boolean;
    emergencyStop: boolean;
    autoRetraining: boolean;
}

export interface Experiment {
    id: string;
    name: string;
    description: string;
    status: ExperimentStatus;
    createdAt: string;
    updatedAt: string;
    features: FeatureConfig;
    model: ModelConfig;
    hyperparameters: HyperparametersConfig;
    reward: RewardConfig;
    environment: EnvironmentConfig;
    resources: ResourceConfig;
    deployment?: DeploymentConfig;
    metrics?: ExperimentMetrics;
}

export interface ExperimentMetrics {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    totalTrades: number;
}

export interface ExperimentSummary {
    id: string;
    name: string;
    symbol: Symbol;
    algorithm: Algorithm;
    status: ExperimentStatus;
    createdAt: string;
    totalReturn?: number;
    sharpeRatio?: number;
    progress?: number;
}
