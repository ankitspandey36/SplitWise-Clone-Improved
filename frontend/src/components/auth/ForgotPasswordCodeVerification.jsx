import React, { useState } from 'react';
import { axiosInstance } from '../../features/axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../layout/Loading';

const ForgotPasswordCodeVerification = () => {
    const [code, setCode] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resendMessage, setResendMessage] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const email = localStorage.getItem("email");

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            setLoading(true);
            await axiosInstance.post('/user/verify-forgot-code', { email, code });
            navigate("/change-password");
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired code.');
        }
        finally {
            setLoading(false)
        }
    };


    const handleResendCode = async () => {
        setResendMessage('');
        setError('');
        try {
            await axiosInstance.post('/user/resend-code', { email });
            setResendMessage('Code resent to your email.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code.');
        }
    };


    if (loading) return <Loading />;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <p className="text-sm text-blue-600 text-center mb-4">
                Didn't receive the code?{' '}
                <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-blue-800 hover:underline font-medium"
                >
                    Resend Code
                </button>
            </p>

            <form onSubmit={handleVerifyCode}>
                <h2 className="text-2xl font-semibold mb-4 text-center">Enter Verification Code</h2>
                <input
                    type="text"
                    placeholder="6-digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={6}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-center tracking-widest"
                />
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                    Verify Code
                </button>
            </form>

            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
            {resendMessage && <p className="mt-4 text-green-600 text-center">{resendMessage}</p>}
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </div>
    );
};

export default ForgotPasswordCodeVerification;
