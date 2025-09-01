import React, { useState } from 'react';
import { axiosInstance } from '../../features/axios';
import Loading from '../layout/Loading';
import { useNavigate } from 'react-router-dom';

const ChangeForgotPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const email = localStorage.getItem("email");
    const navigate = useNavigate()

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        console.log("frontend", email)
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post("/user/reset-password", { email, newPassword, confirmPassword })
            localStorage.removeItem("email");

            navigate("/login")
        } catch (err) {
            setError(err.response?.data?.message || 'Error changing password.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Change Password</h2>


            <form onSubmit={handleChangePassword}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
                >
                    Change Password
                </button>
            </form>


            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </div>
    );
};

export default ChangeForgotPassword;
