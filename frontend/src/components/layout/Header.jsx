import React, { useState } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Search, Bell, Menu, LogOut, User, Settings, Briefcase, Home, Coins, BarChart3, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getAvatarUrl } from '../../utils/helpers';

const Header = () => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

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

    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-white/80 backdrop-blur-md">
            <div className="mx-auto max-w-[1920px] px-4 sm:px-6 lg:px-8">
                <div className="flex h-18 items-center justify-between">
                    {/* Left side - Logo & Navigation */}
                    <div className="flex items-center space-x-9">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center space-x-3">
                            <img
                                src="/logo.svg"
                                alt="VieVerse"
                                className="h-9 w-9"
                            />
                            <span className="hidden sm:block text-xl font-bold text-gradient">
                                VieVerse
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigation.map((item) => (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                            ? 'bg-green-50 text-green-600'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                        }`
                                    }
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Center - Search (Longer and only on larger screens) */}
                    <div className="hidden lg:flex flex-1 mx-8">
                        <Input
                            type="text"
                            placeholder="Tìm kiếm nhiệm vụ, công ty..."
                            icon={Search}
                            className="w-full h-12 rounded-full border-2 border-green-200 px-8 text-base shadow-sm focus:ring-2 focus:ring-green-400"
                        />
                    </div>

                    {/* Right side */}
                    <div className="flex items-center space-x-3">
                        {/* Create Task Button (For companies) */}
                        {user?.role === 'company' && (
                            <Link to="/tasks/create" className="hidden sm:block">
                                <Button
                                    variant="gradient"
                                    size="default"
                                    className="mr-2 h-11"
                                >
                                    Tạo nhiệm vụ
                                </Button>
                            </Link>
                        )}

                        {/* Search button for mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-11 w-11"
                        >
                            <Search className="h-5 w-5" />
                        </Button>

                        {/* Notifications */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative h-11 w-11"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                                3
                            </span>
                        </Button>

                        {/* Token display for students */}
                        {user?.role === 'student' && (
                            <div className="hidden sm:flex items-center space-x-2 bg-amber-50 text-amber-700 px-5 py-2 rounded-full border-2 border-amber-300 shadow-sm">
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                                <span className="font-bold text-base">{user?.tokens || 0}</span>
                            </div>
                        )}

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(true)}
                            className="md:hidden h-11 w-11"
                        >
                            <Menu className="h-5 w-5" />
                        </Button>

                        {/* User menu */}
                        <div className="relative">
                            <Button
                                variant="ghost"
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 h-11"
                            >
                                <img
                                    src={getAvatarUrl(user?.name)}
                                    alt={user?.name}
                                    className="h-9 w-9 rounded-full"
                                />
                                <span className="hidden sm:block text-sm font-medium">
                                    {user?.name}
                                </span>
                            </Button>

                            {/* Dropdown menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500">{user?.email}</p>
                                        <p className="text-xs text-green-600 mt-1">
                                            {user?.role === 'student' ? 'Sinh viên' : 'Doanh nghiệp'}
                                        </p>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            to="/profile"
                                            onClick={() => setShowUserMenu(false)}
                                            className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <User className="h-4 w-4 mr-3" />
                                            Hồ sơ cá nhân
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                // Navigate to settings
                                            }}
                                            className="flex items-center w-full px-5 py-3 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Settings className="h-4 w-4 mr-3" />
                                            Cài đặt
                                        </button>

                                        <hr className="my-1" />

                                        <button
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                logout();
                                            }}
                                            className="flex items-center w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-3" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Overlay */}
                    <div
                        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    ></div>

                    {/* Menu */}
                    <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                        <div className="flex items-center justify-between p-5 border-b">
                            <div className="flex items-center space-x-2">
                                <img src="/logo.svg" alt="VieVerse" className="h-9 w-9" />
                                <span className="text-xl font-bold text-gradient">VieVerse</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setMobileMenuOpen(false)}
                                className="h-11 w-11"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5">
                            <nav className="flex flex-col space-y-2">
                                {navigation.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-colors duration-200 ${isActive
                                                ? 'bg-green-50 text-green-600'
                                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <item.icon className="mr-3 h-5 w-5" />
                                        {item.name}
                                    </NavLink>
                                ))}

                                {user?.role === 'company' && (
                                    <Link
                                        to="/tasks/create"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center px-4 py-3.5 text-sm font-medium rounded-lg transition-colors duration-200 text-white bg-gradient-to-r from-green-600 to-emerald-600"
                                    >
                                        <Plus className="mr-3 h-5 w-5" />
                                        Tạo nhiệm vụ mới
                                    </Link>
                                )}
                            </nav>
                        </div>

                        <div className="border-t border-gray-200 p-5">
                            <div className="flex items-center">
                                <img
                                    src={getAvatarUrl(user?.name)}
                                    alt={user?.name}
                                    className="h-11 w-11 rounded-full"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">
                                        {user?.role === 'student' ? 'Sinh viên' : 'Doanh nghiệp'}
                                    </p>
                                </div>

                                {user?.role === 'student' && (
                                    <div className="ml-auto flex items-center space-x-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full border-2 border-amber-300 shadow-sm">
                                        <Coins className="h-4 w-4" />
                                        <span className="text-base font-bold">{user?.tokens || 0}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
                                className="mt-4 flex w-full items-center justify-center rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile search */}
            <div className="lg:hidden px-4 pb-4">
                <Input
                    type="text"
                    placeholder="Tìm kiếm nhiệm vụ, công ty..."
                    icon={Search}
                    className="w-full h-11 px-6"
                />
            </div>
        </header>
    );
};

export default Header;