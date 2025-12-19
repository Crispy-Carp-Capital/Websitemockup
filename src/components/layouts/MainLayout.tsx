import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useExperimentStore } from '../../stores/experimentStore';

export function MainLayout() {
    const { sidebarCollapsed } = useExperimentStore();

    return (
        <div className="min-h-screen bg-dark-50 dark:bg-dark-900">
            <Sidebar />
            <Header />

            <motion.main
                initial={false}
                animate={{ marginLeft: sidebarCollapsed ? 72 : 240 }}
                transition={{ duration: 0.2 }}
                className="pt-16 min-h-screen"
            >
                <div className="p-6">
                    <Outlet />
                </div>
            </motion.main>
        </div>
    );
}

export default MainLayout;
