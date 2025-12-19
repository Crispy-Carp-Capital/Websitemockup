import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FlaskConical,
    Activity,
    BarChart3,
    Rocket,
    Settings,
    ChevronLeft,
    ChevronRight,
    Plus,
} from 'lucide-react';
import { useExperimentStore } from '../../stores/experimentStore';

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/wizard', icon: FlaskConical, label: 'Experiments' },
    { path: '/training', icon: Activity, label: 'Training Monitor' },
    { path: '/backtest', icon: BarChart3, label: 'Backtest Results' },
    { path: '/live', icon: Rocket, label: 'Live Trading' },
];

export function Sidebar({ collapsed: controlledCollapsed, onToggle }: SidebarProps) {
    const { sidebarCollapsed, toggleSidebar } = useExperimentStore();
    const location = useLocation();

    const collapsed = controlledCollapsed ?? sidebarCollapsed;
    const toggle = onToggle ?? toggleSidebar;

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-0 h-full bg-white dark:bg-dark-800 border-r border-dark-200 dark:border-dark-700 z-40 flex flex-col"
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-200 dark:border-dark-700">
                <AnimatePresence mode="wait">
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                        >
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-dark-900 dark:text-white">RL Trading</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button
                    onClick={toggle}
                    className="p-1.5 rounded-lg hover:bg-dark-100 dark:hover:bg-dark-700 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-4 h-4 text-dark-500" />
                    ) : (
                        <ChevronLeft className="w-4 h-4 text-dark-500" />
                    )}
                </button>
            </div>

            {/* New Experiment Button */}
            <div className="p-3">
                <NavLink
                    to="/wizard"
                    className={`
            flex items-center justify-center gap-2 w-full py-2.5 rounded-lg
            bg-primary-500 hover:bg-primary-600 text-white font-medium
            transition-all duration-150
            ${collapsed ? 'px-2' : 'px-4'}
          `}
                >
                    <Plus className="w-5 h-5" />
                    {!collapsed && <span>New Experiment</span>}
                </NavLink>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                    : 'text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700 hover:text-dark-900 dark:hover:text-dark-100'
                                }
                ${collapsed ? 'justify-center' : ''}
              `}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-500' : ''}`} />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Settings */}
            <div className="p-3 border-t border-dark-200 dark:border-dark-700">
                <NavLink
                    to="/settings"
                    className={`
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
            text-dark-600 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-700
            ${collapsed ? 'justify-center' : ''}
          `}
                >
                    <Settings className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">Settings</span>}
                </NavLink>
            </div>
        </motion.aside>
    );
}

export default Sidebar;
