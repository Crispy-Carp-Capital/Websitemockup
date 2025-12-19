import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search,
    Bell,
    Sun,
    Moon,
    User,
    ChevronDown,
} from 'lucide-react';
import { useExperimentStore } from '../../stores/experimentStore';

const routeTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/wizard': 'New Experiment',
    '/training': 'Training Monitor',
    '/backtest': 'Backtest Results',
    '/live': 'Live Trading',
    '/settings': 'Settings',
};

export function Header() {
    const location = useLocation();
    const { isDarkMode, toggleDarkMode, sidebarCollapsed } = useExperimentStore();
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    const title = routeTitles[location.pathname] || 'RL Trading Platform';

    // Apply dark mode class to document
    React.useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <header
            className={`
        fixed top-0 right-0 h-16 bg-white dark:bg-dark-800 border-b border-dark-200 dark:border-dark-700 z-30
        transition-all duration-200
        ${sidebarCollapsed ? 'left-[72px]' : 'left-[240px]'}
      `}
        >
            <div className="h-full flex items-center justify-between px-6">
                {/* Left: Title & Breadcrumb */}
                <div>
                    <h1 className="text-xl font-bold text-dark-900 dark:text-white">
                        {title}
                    </h1>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
                        <input
                            type="text"
                            placeholder="Search experiments..."
                            className="
                w-64 pl-10 pr-4 py-2 text-sm
                bg-dark-50 dark:bg-dark-900 border border-dark-200 dark:border-dark-700
                rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
                text-dark-900 dark:text-dark-100 placeholder-dark-400
              "
                        />
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className="p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-dark-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-dark-600" />
                        )}
                    </button>

                    {/* Notifications */}
                    <button
                        className="relative p-2 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-dark-600 dark:text-dark-400" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
                    </button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                            </div>
                            <ChevronDown className="w-4 h-4 text-dark-400" />
                        </button>

                        {showUserMenu && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 border border-dark-200 dark:border-dark-700 rounded-lg shadow-lg py-1"
                                >
                                    <div className="px-4 py-2 border-b border-dark-200 dark:border-dark-700">
                                        <p className="text-sm font-medium text-dark-900 dark:text-dark-100">
                                            RL Trader
                                        </p>
                                        <p className="text-xs text-dark-500">trader@example.com</p>
                                    </div>
                                    <button className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
                                        Profile
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
                                        API Keys
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-dark-700 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-700">
                                        Billing
                                    </button>
                                    <div className="border-t border-dark-200 dark:border-dark-700 mt-1 pt-1">
                                        <button className="w-full text-left px-4 py-2 text-sm text-error-600 dark:text-error-400 hover:bg-dark-100 dark:hover:bg-dark-700">
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                                <div
                                    className="fixed inset-0 z-[-1]"
                                    onClick={() => setShowUserMenu(false)}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
