import React, { useState } from 'react';
import { axiosInstance } from '../../features/axios';
import { useNavigate } from "react-router-dom";
import Loading from '../layout/Loading';


const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();

        setMessage('');
        setError('');
        try {
            setLoading(true)
            localStorage.setItem("email", email);
            await axiosInstance.post("/user/forgot-password", { email });
            navigate("/forgotpassword-emailverify")
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        }
        finally {
            setLoading(false)
        }
    };

    if (loading) return <Loading />;

    return (
        <form onSubmit={handleVerify} className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button
                type='submit'
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
            >
                Verify
            </button>
            {message && <p className="mt-4 text-green-600 text-center">{message}</p>}
            {error && <p className="mt-4 text-red-600 text-center">{error}</p>}
        </form>
    );
};

export default ForgotPassword;
