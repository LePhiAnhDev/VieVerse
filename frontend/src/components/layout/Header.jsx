import React, { useState } from 'react';
import { Search, Bell, Menu, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { getAvatarUrl } from '../../utils/helpers';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Left side */}
                <div className="flex items-center space-x-4">
                    {/* Mobile menu button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onMenuClick}
                        className="lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <img
                            src="/logo.svg"
                            alt="VieVerse"
                            className="h-8 w-8"
                        />
                        <span className="hidden sm:block text-xl font-bold text-gradient">
                            VieVerse
                        </span>
                    </div>
                </div>

                {/* Center - Search */}
                <div className="hidden md:flex flex-1 max-w-lg mx-8">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm nhiệm vụ, công ty..."
                        icon={Search}
                        className="w-full"
                    />
                </div>

                {/* Right side */}
                <div className="flex items-center space-x-2">
                    {/* Search button for mobile */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Notifications */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            3
                        </span>
                    </Button>

                    {/* Token display for students */}
                    {user?.role === 'student' && (
                        <div className="hidden sm:flex items-center space-x-1 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{user?.tokens || 0}</span>
                        </div>
                    )}

                    {/* User menu */}
                    <div className="relative">
                        <Button
                            variant="ghost"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center space-x-2"
                        >
                            <img
                                src={getAvatarUrl(user?.name)}
                                alt={user?.name}
                                className="h-8 w-8 rounded-full"
                            />
                            <span className="hidden sm:block text-sm font-medium">
                                {user?.name}
                            </span>
                        </Button>

                        {/* Dropdown menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        {user?.role === 'student' ? 'Sinh viên' : 'Doanh nghiệp'}
                                    </p>
                                </div>

                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // Navigate to profile
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                        <User className="h-4 w-4 mr-3" />
                                        Hồ sơ cá nhân
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            // Navigate to settings
                                        }}
                                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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

            {/* Mobile search */}
            <div className="md:hidden px-4 pb-4">
                <Input
                    type="text"
                    placeholder="Tìm kiếm nhiệm vụ, công ty..."
                    icon={Search}
                    className="w-full"
                />
            </div>
        </header>
    );
};

export default Header;