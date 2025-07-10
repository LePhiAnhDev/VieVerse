import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Briefcase,
    User,
    Coins,
    Plus,
    BarChart3,
    Settings,
    X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn, getAvatarUrl } from '../../utils/helpers';
import Button from '../ui/Button';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/dashboard',
            icon: Home,
            show: true
        },
        {
            name: 'Nhiệm vụ',
            href: '/tasks',
            icon: Briefcase,
            show: true
        },
        {
            name: 'Token của tôi',
            href: '/tokens',
            icon: Coins,
            show: user?.role === 'student'
        },
        {
            name: 'Thống kê',
            href: '/analytics',
            icon: BarChart3,
            show: user?.role === 'company'
        },
        {
            name: 'Hồ sơ',
            href: '/profile',
            icon: User,
            show: true
        }
    ].filter(item => item.show);

    const SidebarContent = () => (
        <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <img src="/logo.svg" alt="VieVerse" className="h-8 w-8" />
                    <span className="text-xl font-bold text-gradient">VieVerse</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="lg:hidden"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {navigation.map(item => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={onClose}
                        className={({ isActive }) =>
                            cn(
                                'flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                                'hover:bg-gray-50 group',
                                isActive
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'text-gray-700 hover:text-gray-900'
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}

                {/* Quick Action for Companies */}
                {user?.role === 'company' && (
                    <div className="pt-4 border-t border-gray-200">
                        <NavLink
                            to="/tasks/create"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        >
                            <Plus className="mr-3 h-5 w-5 flex-shrink-0" />
                            Tạo nhiệm vụ mới
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* User info */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3 p-3 rounded-xl bg-gray-50">
                    <img
                        src={getAvatarUrl(user?.name)}
                        alt={user?.name}
                        className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {user?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                            {user?.role === 'student' ? 'Sinh viên' : 'Doanh nghiệp'}
                        </p>
                    </div>
                    {user?.role === 'student' && (
                        <div className="flex items-center space-x-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">
                            <Coins className="h-3 w-3" />
                            <span className="text-xs font-medium">{user?.tokens || 0}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <SidebarContent />
            </aside>
        </>
    );
};

export default Sidebar;
