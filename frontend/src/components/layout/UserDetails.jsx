import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../features/axios.js';

const UserDetails = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [userDetails, setUserDetails] = useState(null);
    const [editingUpi, setEditingUpi] = useState(false);
    const [newUpi, setNewUpi] = useState('');

    const handleLogout = async () => {
        try {
            await axiosInstance.post("/user/logout");
            navigate('/');
        } catch {
            alert("Logout Unsuccessful");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(message);
        await axiosInstance.post('/user/setSuggestion', { suggestion: message });
        setMessage('');
    };

    const handleUpiUpdate = async () => {
        try {
            await axiosInstance.post('/user/updateUpi', { upid: newUpi });
            setUserDetails({ ...userDetails, upid: newUpi });
            setEditingUpi(false);
            setNewUpi('');
            alert('UPI ID updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update UPI ID.');
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get('/user/me');
                setUserDetails(res.data.data);
            } catch {
                setUserDetails(null);
            }
        })();
    }, []);

    if (!userDetails) {
        return <div className="text-center py-10">Loading user details...</div>;
    }

    const username = userDetails.email?.split('@')[0] || "User";

    return (
        <div className="bg-white shadow-md rounded-xl p-6 max-w-md mx-auto space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">{username}</h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold
          ${userDetails.isVerified ? 'bg-green-200 text-green-900' : 'bg-red-200 text-red-900'}`}>
                    {userDetails.isVerified ? "Verified" : "Not Verified"}
                </span>
            </div>

            <div className="space-y-2 text-gray-700">
                <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <span className="font-semibold">{userDetails.email}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span>Friends Count:</span>
                    <span className="font-semibold">{userDetails.friends?.length ?? 0}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span>Joined:</span>
                    <span className="font-semibold">{userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : '-'}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span>UPI ID:</span>
                    {editingUpi ? (
                        <div className="flex gap-2 items-center">
                            <input
                                value={newUpi}
                                onChange={(e) => setNewUpi(e.target.value)}
                                placeholder="Enter new UPI ID"
                                className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={handleUpiUpdate}
                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setEditingUpi(false)}
                                className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <span className="font-semibold flex gap-2 items-center">
                            {userDetails.upid || "Not set"}
                            <button
                                onClick={() => setEditingUpi(true)}
                                className="text-blue-500 underline text-sm"
                            >
                                Update
                            </button>
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded py-2 font-semibold"
            >
                Logout
            </button>

            <form onSubmit={handleSubmit} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Contact Us</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
                >
                    Send Message
                </button>
            </form>
        </div>
    );
};

export default UserDetails;
