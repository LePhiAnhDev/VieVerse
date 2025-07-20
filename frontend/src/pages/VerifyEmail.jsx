import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/ui/Button';
import axios from 'axios';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            if (!token) {
                setError('Token xác minh không hợp lệ');
                setLoading(false);
                return;
            }

            try {
                // const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify-email?token=${token}`);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}`);
                if (response.data.success) {
                    setSuccess(true);
                    localStorage.setItem('token', response.data.token);
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    setError(response.data.error || 'Xác minh email thất bại');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Lỗi xác minh email');
            } finally {
                setLoading(false);
            }
        };
        verifyEmail();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center modern-gradient p-4">
            <div className="absolute inset-0 grid-pattern opacity-20" />
            <div className="w-full max-w-md relative z-10">
                {loading && <LoadingSpinner fullScreen />}
                {error && (
                    <EmptyState
                        title="Lỗi xác minh"
                        description={error}
                        action={
                            <Button onClick={() => navigate('/login')}>
                                Quay lại đăng nhập
                            </Button>
                        }
                    />
                )}
                {success && (
                    <EmptyState
                        title="Xác minh thành công!"
                        description="Tài khoản của bạn đã được xác minh. Đang chuyển hướng đến dashboard..."
                        action={
                            <Button onClick={() => navigate('/dashboard')}>
                                Đi đến Dashboard
                            </Button>
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;