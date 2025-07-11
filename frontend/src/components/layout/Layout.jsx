import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Background pattern */}
            <div className="fixed inset-0 grid-pattern opacity-80 pointer-events-none"></div>

            {/* Header */}
            <Header />

            {/* Page content */}
            <main className="flex-1 overflow-y-auto scrollbar-thin relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;