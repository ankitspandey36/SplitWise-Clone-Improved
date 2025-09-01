import React, { useState } from 'react';
import GroupDetail from './GroupDetail';
import UngroupedExpenses from './UngroupedExpenses';

function DashBoard() {
  const [selected, setSelected] = useState('friends');

  return (
    <div className="p-4">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setSelected('friends')}
          className={`px-6 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
            selected === 'friends'
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setSelected('groups')}
          className={`px-6 py-2 rounded-lg border text-sm font-medium transition-all duration-300 ${
            selected === 'groups'
              ? 'bg-blue-600 text-white border-blue-600 shadow'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          Groups
        </button>
      </div>

      <div>
        {selected === 'friends' ? <UngroupedExpenses /> : <GroupDetail />}
      </div>
    </div>
  );
}

export default DashBoard;
