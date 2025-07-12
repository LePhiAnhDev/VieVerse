import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Web3Provider } from './contexts/Web3Context';

// Components
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import Profile from './pages/Profile';

// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="xl" text="Đang tải..." fullScreen />;
    }

    return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner size="xl" text="Đang tải..." fullScreen />;
    }

    return !user ? children : <Navigate to="/dashboard" replace />;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Web3Provider>
                <AuthProvider>
                    <Router>
                        <div className="min-h-screen bg-gray-50">
                            {/* Toast notifications */}
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 4000,
                                    style: {
                                        background: '#363636',
                                        color: '#fff',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    },
                                    success: {
                                        style: {
                                            background: '#10B981',
                                        },
                                    },
                                    error: {
                                        style: {
                                            background: '#EF4444',
                                        },
                                    },
                                    loading: {
                                        style: {
                                            background: '#3B82F6',
                                        },
                                    },
                                }}
                            />

                            <Routes>
                                {/* Public routes */}
                                <Route
                                    path="/login"
                                    element={
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/register"
                                    element={
                                        <PublicRoute>
                                            <Register />
                                        </PublicRoute>
                                    }
                                />

                                {/* Protected routes */}
                                <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <Layout />
                                        </ProtectedRoute>
                                    }
                                >
                                    <Route index element={<Navigate to="/dashboard" replace />} />
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="tasks" element={<Tasks />} />
                                    <Route path="tasks/:id" element={<TaskDetail />} />
                                    <Route path="profile" element={<Profile />} />
                                </Route>

                                {/* Fallback route */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </div>
                    </Router>
                </AuthProvider>
            </Web3Provider>
        </QueryClientProvider>
    );
}

export default App;