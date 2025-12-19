import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layouts/MainLayout';
import { HomePage } from './components/dashboards/HomePage';
import { TrainingMonitor } from './components/dashboards/TrainingMonitor';
import { BacktestDashboard } from './components/dashboards/BacktestDashboard';
import { LiveTradingDashboard } from './components/dashboards/LiveTradingDashboard';
import { ExperimentWizard } from './components/wizard/ExperimentWizard';

function SettingsPage() {
    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-dark-900 dark:text-white mb-4">Settings</h2>
            <p className="text-dark-500">Settings page coming soon...</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/wizard" element={<ExperimentWizard />} />
                    <Route path="/training" element={<TrainingMonitor />} />
                    <Route path="/backtest" element={<BacktestDashboard />} />
                    <Route path="/live" element={<LiveTradingDashboard />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
