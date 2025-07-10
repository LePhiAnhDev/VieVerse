import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen flex bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header */}
                <Header onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto scrollbar-thin">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;