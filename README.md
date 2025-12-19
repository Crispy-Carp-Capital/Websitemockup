# RL Trading Platform

A production-ready React 19 + TypeScript frontend for building, training, and deploying reinforcement learning trading agents.

## Tech Stack

- **React 19** with TypeScript
- **Tailwind CSS** for styling with custom color palette
- **Zustand** for state management
- **Recharts** for interactive charts
- **React Router v7** for navigation
- **TanStack Table** for data grids
- **Lucide React** for icons
- **Framer Motion** for animations

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── dashboards/     # HomePage, TrainingMonitor, BacktestDashboard, LiveTrading
│   ├── wizard/         # 6-step ExperimentWizard
│   ├── layouts/        # MainLayout, Sidebar, Header
│   └── shared/         # FormControls, Charts, KPICards, ProgressBar
├── stores/             # Zustand stores (experiment, training, backtest)
├── hooks/              # Custom hooks (useWebSocket, useMockTrainingData)
├── utils/              # Formatters, mock data generators
└── types/              # TypeScript interfaces
```

## Features

- **Dashboard**: View all experiments, active trainings, quick stats
- **Experiment Wizard**: 6-step configuration for data, model, hyperparameters, reward, environment, and deployment
- **Training Monitor**: Real-time learning curves, action stats, candlestick chart with agent trades
- **Backtest Results**: Equity curve, drawdown, monthly heatmap, trade log, comparison table
- **Live Trading**: Real-time price, position tracking, alerts, system health

## Notes

- All data is mocked (no backend required)
- Dark mode persists to localStorage
- Responsive design for all screen sizes
