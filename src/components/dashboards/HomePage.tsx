import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FlaskConical,
    TrendingUp,
    Rocket,
    Activity,
    ArrowRight,
    Clock,
} from 'lucide-react';
import { useExperimentStore } from '../../stores/experimentStore';
import { StatusBadge, StatsRow } from '../shared/KPICards';
import { ProgressBar } from '../shared/ProgressBar';
import { formatPercent, formatRatio, formatRelativeTime } from '../../utils/formatters';

export function HomePage() {
    const { experiments } = useExperimentStore();

    const stats = [
        { label: 'Total Experiments', value: experiments.length },
        { label: 'Deployed Models', value: experiments.filter(e => e.status === 'deployed').length },
        { label: 'Avg Return', value: 8.5, format: 'percent' as const },
        { label: 'Best Sharpe', value: 1.92, format: 'ratio' as const },
    ];

    const activeTrainings = experiments.filter(e => e.status === 'training');

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-dark-900 dark:text-white">
                        Welcome back! 👋
                    </h2>
                    <p className="text-dark-500 dark:text-dark-400 mt-1">
                        Here's what's happening with your RL trading experiments.
                    </p>
                </div>
                <Link
                    to="/wizard"
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors"
                >
                    <FlaskConical className="w-5 h-5" />
                    New Experiment
                </Link>
            </div>

            {/* Quick Stats */}
            <StatsRow stats={stats} />

            {/* Active Trainings */}
            {activeTrainings.length > 0 && (
                <div className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-500" />
                            Active Trainings
                        </h3>
                        <Link
                            to="/training"
                            className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
                        >
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {activeTrainings.map((exp) => (
                            <Link
                                key={exp.id}
                                to="/training"
                                className="block p-4 rounded-lg bg-dark-50 dark:bg-dark-900/50 hover:bg-dark-100 dark:hover:bg-dark-900 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-dark-900 dark:text-white">
                                            {exp.name}
                                        </span>
                                        <StatusBadge status="training" size="sm" />
                                    </div>
                                    <span className="text-sm text-dark-500">
                                        {exp.algorithm} • {exp.symbol}
                                    </span>
                                </div>
                                <ProgressBar
                                    progress={exp.progress || 0}
                                    size="sm"
                                    showLabel={false}
                                />
                                <div className="flex items-center justify-between mt-2 text-sm text-dark-500">
                                    <span>{(exp.progress || 0).toFixed(1)}% complete</span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Started {formatRelativeTime(exp.createdAt)}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Experiments Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                        Recent Experiments
                    </h3>
                    <Link
                        to="/wizard"
                        className="text-sm text-primary-500 hover:text-primary-600"
                    >
                        View All
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {experiments.slice(0, 6).map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-dark-800 rounded-xl border border-dark-200 dark:border-dark-700 p-5 card-hover cursor-pointer"
                        >
                            <Link to={exp.status === 'training' ? '/training' : '/backtest'}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold text-dark-900 dark:text-white">
                                            {exp.name}
                                        </h4>
                                        <p className="text-sm text-dark-500 mt-0.5">
                                            {exp.symbol} • {exp.algorithm}
                                        </p>
                                    </div>
                                    <StatusBadge status={exp.status} size="sm" />
                                </div>

                                {exp.totalReturn !== undefined && (
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-dark-500 mb-1">Total Return</p>
                                            <p className={`text-lg font-bold ${exp.totalReturn > 0 ? 'text-success-500' : 'text-error-500'
                                                }`}>
                                                {formatPercent(exp.totalReturn)}
                                            </p>
                                        </div>
                                        {exp.sharpeRatio !== undefined && (
                                            <div>
                                                <p className="text-xs text-dark-500 mb-1">Sharpe Ratio</p>
                                                <p className="text-lg font-bold text-dark-900 dark:text-white">
                                                    {formatRatio(exp.sharpeRatio)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {exp.status === 'training' && exp.progress !== undefined && (
                                    <div className="mt-4">
                                        <ProgressBar progress={exp.progress} size="sm" />
                                    </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-dark-100 dark:border-dark-700">
                                    <p className="text-xs text-dark-500">
                                        Created {formatRelativeTime(exp.createdAt)}
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/wizard"
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl text-white hover:from-primary-600 hover:to-primary-700 transition-all"
                >
                    <div className="p-3 bg-white/20 rounded-lg">
                        <FlaskConical className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold">Create Experiment</h4>
                        <p className="text-sm text-primary-100">Start a new RL training</p>
                    </div>
                </Link>

                <Link
                    to="/backtest"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl hover:border-primary-500 transition-all"
                >
                    <div className="p-3 bg-success-100 dark:bg-success-900/30 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-dark-900 dark:text-white">View Backtests</h4>
                        <p className="text-sm text-dark-500">Analyze past results</p>
                    </div>
                </Link>

                <Link
                    to="/live"
                    className="flex items-center gap-4 p-4 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-xl hover:border-primary-500 transition-all"
                >
                    <div className="p-3 bg-warning-100 dark:bg-warning-900/30 rounded-lg">
                        <Rocket className="w-6 h-6 text-warning-600 dark:text-warning-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-dark-900 dark:text-white">Live Trading</h4>
                        <p className="text-sm text-dark-500">Monitor deployed agents</p>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default HomePage;
