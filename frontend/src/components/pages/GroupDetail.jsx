import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../features/axios';
import AddFriend from './AddFriend';

const GroupDetail = () => {
  const [groups, setGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const navigate = useNavigate();
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axiosInstance.get('/group/get-groups');
      // console.log(res);      
      setGroups(res.data.data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  const handleAddMember = () => {
    setShowAddFriend(true);

  }

  const handleGroupClick = (groupId) => {
    navigate(`/splitwise/group/${groupId}`);
  };

  const handleCreateGroup = async () => {
    try {
      await axiosInstance.post('/group/create', { name: groupName })
      setShowModal(false);
      setGroupName('');
      fetchGroups();
    } catch (error) {
      console.error("Group creation failed", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">All Groups</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            + Create Group
          </button>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            onClick={handleAddMember}
          >
            + Add Friend
          </button>
        </div>
      </div>


      {/* Group Cards */}
      <div className="grid gap-4">
        {groups.length === 0 ? (
          <div className="text-gray-500">No groups available.</div>
        ) : (
          groups.map(group => (
            <div
              key={group._id}
              className="border p-4 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => handleGroupClick(group._id)}
            >
              <div className="text-xl font-semibold">{group.name}</div>
              <div className="text-sm text-gray-600">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Members: {group.members?.length ?? 0}
              </div>
            </div>
          ))
        )}

      </div>


      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a New Group</h2>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddFriend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowAddFriend(false)}
            >
              &times;
            </button>
            <AddFriend closePopup={() => setShowAddFriend(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
