import { useState } from 'react';
import { axiosInstance } from '../../features/axios';

const AddFriend = ({ closePopup }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email.trim() === '') return;
    try {
      const res = await axiosInstance.post("/user/add-friend", { email });
      setEmail('');
      closePopup();
    } catch (error) {
      const message = error.response.data.message || "Something went wrong";
      console.log(message);      
      alert(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/20">
      <div
        className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add a Friend</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter email address"
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:border-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closePopup}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add Friend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFriend;
