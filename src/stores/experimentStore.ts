import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    Experiment,
    ExperimentSummary,
    FeatureConfig,
    ModelConfig,
    HyperparametersConfig,
    RewardConfig,
    EnvironmentConfig,
    ResourceConfig,
    DeploymentConfig,
    TimeframeConfig,
    ICTFeatures,
    DataSourceConfig,
} from '../types/experiment';

// Default values
const defaultDataSource: DataSourceConfig = {
    exchange: 'binance',
    symbol: 'BTCUSDT',
    baseTimeframe: '1h',
    startDate: '2023-01-01',
    endDate: '2025-12-31',
    includeOnChain: false,
    includeOpenInterest: true,
};

const defaultTimeframe: TimeframeConfig = {
    id: 'tf-1',
    timeframe: '1h',
    lookback: 168,
    indicators: [
        { id: 'ohlcv', name: 'OHLCV', category: 'trend', enabled: true },
        { id: 'rsi', name: 'RSI', category: 'momentum', enabled: true },
        { id: 'bb', name: 'Bollinger Bands', category: 'volatility', enabled: true },
        { id: 'macd', name: 'MACD', category: 'momentum', enabled: false },
        { id: 'ema', name: 'EMA', category: 'trend', enabled: false },
        { id: 'sma', name: 'SMA', category: 'trend', enabled: false },
        { id: 'atr', name: 'ATR', category: 'volatility', enabled: false },
        { id: 'volume', name: 'Volume', category: 'volume', enabled: true },
    ],
};

const defaultICTFeatures: ICTFeatures = {
    orderBlock: true,
    fairValueGap: true,
    marketStructure: true,
    liquidityPools: true,
    institutionalFlow: false,
};

const defaultFeatures: FeatureConfig = {
    dataSource: defaultDataSource,
    timeframes: [defaultTimeframe],
    ictFeatures: defaultICTFeatures,
    totalFeatures: 1854,
    estimatedMemory: '2.4 MB',
};

const defaultModel: ModelConfig = {
    algorithm: 'PPO',
    architecture: 'LSTM',
    valueFunction: 'shared',
    preset: 'balanced',
    hiddenSize: 256,
    numLayers: 2,
};

const defaultHyperparameters: HyperparametersConfig = {
    learningRate: 0.0003,
    entropyCoefficient: 0.01,
    discountFactor: 0.99,
    gaeLambda: 0.95,
    clipRatio: 0.2,
    totalTimesteps: 500000,
    rolloutBufferSize: 2048,
    batchSize: 64,
    epochsPerUpdate: 10,
    updateFrequency: 2048,
};

const defaultReward: RewardConfig = {
    type: 'pure_pnl',
    pnlWeight: 0.6,
    sharpeWeight: 0.3,
    turnoverPenalty: 0.1,
    rewardClipping: true,
};

const defaultEnvironment: EnvironmentConfig = {
    normalizeObservations: true,
    runningNormalization: true,
    rewardNormalization: true,
    startingCapital: 10000,
    maxPositionSize: 20,
    maxSimultaneousPositions: 1,
    slippage: 0.05,
    takerFee: 0.02,
};

const defaultResources: ResourceConfig = {
    compute: 'H100',
    environment: 'local',
    multiEnvironment: true,
    distributedTraining: false,
    numEnvs: 8,
};

const defaultDeployment: DeploymentConfig = {
    target: 'paper_testnet',
    exchange: 'binance',
    positionSize: 5,
    maxSimultaneousTrades: 1,
    maxDailyLoss: 5,
    maxDrawdown: 10,
    realTimeMonitoring: true,
    emergencyStop: true,
    autoRetraining: false,
};

// Mock experiments for dashboard
const mockExperiments: ExperimentSummary[] = [
    {
        id: 'exp-001',
        name: 'PPO_BTCUSDT_v1',
        symbol: 'BTCUSDT',
        algorithm: 'PPO',
        status: 'completed',
        createdAt: '2025-12-15T10:30:00Z',
        totalReturn: 12.5,
        sharpeRatio: 1.45,
    },
    {
        id: 'exp-002',
        name: 'DQN_ETHUSDT_ICT',
        symbol: 'ETHUSDT',
        algorithm: 'DQN',
        status: 'training',
        createdAt: '2025-12-18T14:20:00Z',
        progress: 75,
    },
    {
        id: 'exp-003',
        name: 'SAC_BTCUSDT_MultiTF',
        symbol: 'BTCUSDT',
        algorithm: 'SAC',
        status: 'completed',
        createdAt: '2025-12-10T08:15:00Z',
        totalReturn: -3.2,
        sharpeRatio: 0.85,
    },
    {
        id: 'exp-004',
        name: 'PPO_SOLUSDT_Aggressive',
        symbol: 'SOLUSDT',
        algorithm: 'PPO',
        status: 'deployed',
        createdAt: '2025-12-01T16:45:00Z',
        totalReturn: 18.7,
        sharpeRatio: 1.92,
    },
    {
        id: 'exp-005',
        name: 'TRPO_BNBUSDT_Conservative',
        symbol: 'BNBUSDT',
        algorithm: 'TRPO',
        status: 'failed',
        createdAt: '2025-12-12T09:00:00Z',
    },
    {
        id: 'exp-006',
        name: 'A3C_BTCUSDT_HighFreq',
        symbol: 'BTCUSDT',
        algorithm: 'A3C',
        status: 'training',
        createdAt: '2025-12-19T06:30:00Z',
        progress: 42,
    },
];

interface ExperimentState {
    // Current wizard state
    currentStep: number;
    experimentName: string;
    experimentDescription: string;
    features: FeatureConfig;
    model: ModelConfig;
    hyperparameters: HyperparametersConfig;
    reward: RewardConfig;
    environment: EnvironmentConfig;
    resources: ResourceConfig;
    deployment: DeploymentConfig;

    // Saved experiments
    experiments: ExperimentSummary[];
    savedConfigs: Experiment[];

    // UI state
    isDarkMode: boolean;
    sidebarCollapsed: boolean;

    // Actions
    setCurrentStep: (step: number) => void;
    setExperimentName: (name: string) => void;
    setExperimentDescription: (desc: string) => void;
    updateFeatures: (features: Partial<FeatureConfig>) => void;
    updateDataSource: (dataSource: Partial<DataSourceConfig>) => void;
    addTimeframe: () => void;
    removeTimeframe: (id: string) => void;
    updateTimeframe: (id: string, updates: Partial<TimeframeConfig>) => void;
    updateICTFeatures: (ict: Partial<ICTFeatures>) => void;
    updateModel: (model: Partial<ModelConfig>) => void;
    updateHyperparameters: (params: Partial<HyperparametersConfig>) => void;
    updateReward: (reward: Partial<RewardConfig>) => void;
    updateEnvironment: (env: Partial<EnvironmentConfig>) => void;
    updateResources: (resources: Partial<ResourceConfig>) => void;
    updateDeployment: (deployment: Partial<DeploymentConfig>) => void;
    resetWizard: () => void;
    applyPreset: (preset: 'aggressive' | 'balanced' | 'conservative') => void;
    toggleDarkMode: () => void;
    toggleSidebar: () => void;
    getExperimentConfig: () => Omit<Experiment, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
}

export const useExperimentStore = create<ExperimentState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentStep: 1,
            experimentName: 'PPO_BTCUSDT_v1',
            experimentDescription: '',
            features: defaultFeatures,
            model: defaultModel,
            hyperparameters: defaultHyperparameters,
            reward: defaultReward,
            environment: defaultEnvironment,
            resources: defaultResources,
            deployment: defaultDeployment,
            experiments: mockExperiments,
            savedConfigs: [],
            isDarkMode: true,
            sidebarCollapsed: false,

            // Actions
            setCurrentStep: (step) => set({ currentStep: step }),
            setExperimentName: (name) => set({ experimentName: name }),
            setExperimentDescription: (desc) => set({ experimentDescription: desc }),

            updateFeatures: (features) =>
                set((state) => ({
                    features: { ...state.features, ...features },
                })),

            updateDataSource: (dataSource) =>
                set((state) => ({
                    features: {
                        ...state.features,
                        dataSource: { ...state.features.dataSource, ...dataSource },
                    },
                })),

            addTimeframe: () =>
                set((state) => {
                    const newId = `tf-${Date.now()}`;
                    const newTimeframe: TimeframeConfig = {
                        ...defaultTimeframe,
                        id: newId,
                        timeframe: '15m',
                    };
                    return {
                        features: {
                            ...state.features,
                            timeframes: [...state.features.timeframes, newTimeframe],
                        },
                    };
                }),

            removeTimeframe: (id) =>
                set((state) => ({
                    features: {
                        ...state.features,
                        timeframes: state.features.timeframes.filter((tf) => tf.id !== id),
                    },
                })),

            updateTimeframe: (id, updates) =>
                set((state) => ({
                    features: {
                        ...state.features,
                        timeframes: state.features.timeframes.map((tf) =>
                            tf.id === id ? { ...tf, ...updates } : tf
                        ),
                    },
                })),

            updateICTFeatures: (ict) =>
                set((state) => ({
                    features: {
                        ...state.features,
                        ictFeatures: { ...state.features.ictFeatures, ...ict },
                    },
                })),

            updateModel: (model) =>
                set((state) => ({
                    model: { ...state.model, ...model },
                })),

            updateHyperparameters: (params) =>
                set((state) => ({
                    hyperparameters: { ...state.hyperparameters, ...params },
                })),

            updateReward: (reward) =>
                set((state) => ({
                    reward: { ...state.reward, ...reward },
                })),

            updateEnvironment: (env) =>
                set((state) => ({
                    environment: { ...state.environment, ...env },
                })),

            updateResources: (resources) =>
                set((state) => ({
                    resources: { ...state.resources, ...resources },
                })),

            updateDeployment: (deployment) =>
                set((state) => ({
                    deployment: { ...state.deployment, ...deployment },
                })),

            resetWizard: () =>
                set({
                    currentStep: 1,
                    experimentName: 'PPO_BTCUSDT_v1',
                    experimentDescription: '',
                    features: defaultFeatures,
                    model: defaultModel,
                    hyperparameters: defaultHyperparameters,
                    reward: defaultReward,
                    environment: defaultEnvironment,
                    resources: defaultResources,
                    deployment: defaultDeployment,
                }),

            applyPreset: (preset) => {
                const presets = {
                    aggressive: {
                        learningRate: 0.001,
                        entropyCoefficient: 0.05,
                        discountFactor: 0.95,
                        clipRatio: 0.3,
                    },
                    balanced: {
                        learningRate: 0.0003,
                        entropyCoefficient: 0.01,
                        discountFactor: 0.99,
                        clipRatio: 0.2,
                    },
                    conservative: {
                        learningRate: 0.0001,
                        entropyCoefficient: 0.005,
                        discountFactor: 0.995,
                        clipRatio: 0.1,
                    },
                };
                set((state) => ({
                    hyperparameters: { ...state.hyperparameters, ...presets[preset] },
                    model: { ...state.model, preset },
                }));
            },

            toggleDarkMode: () =>
                set((state) => {
                    const newMode = !state.isDarkMode;
                    if (newMode) {
                        document.documentElement.classList.add('dark');
                    } else {
                        document.documentElement.classList.remove('dark');
                    }
                    return { isDarkMode: newMode };
                }),

            toggleSidebar: () =>
                set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

            getExperimentConfig: () => {
                const state = get();
                return {
                    name: state.experimentName,
                    description: state.experimentDescription,
                    features: state.features,
                    model: state.model,
                    hyperparameters: state.hyperparameters,
                    reward: state.reward,
                    environment: state.environment,
                    resources: state.resources,
                    deployment: state.deployment,
                };
            },
        }),
        {
            name: 'experiment-store',
            partialize: (state) => ({
                isDarkMode: state.isDarkMode,
                sidebarCollapsed: state.sidebarCollapsed,
                savedConfigs: state.savedConfigs,
            }),
        }
    )
);
