import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GroupExpenses from "./GroupExpensesview";
import Message from "./Message"
import { axiosInstance } from "../../features/axios";

const IndividualGroup = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [friends, setFriends] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [addmember, setAddMember] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [message, setmessage] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
    fetchGroupExpenses();
  }, [groupId]);

  useEffect(() => {
    (async () => {
      try {
        const [resFriends, resUser] = await Promise.all([
          axiosInstance.get("/user/get-friend"),
          axiosInstance.get("/user/me"),
        ]);
        setCurrentUserId(resUser.data.data._id);
        setFriends(
          Array.isArray(resFriends.data?.data) ? resFriends.data?.data : []
        );
      } catch (error) {
        console.error("Error fetching user or friends:", error);
      }
    })();
  }, []);

  const fetchGroupDetails = async () => {
    try {
      const res = await axiosInstance.get(`/group/${groupId}/get-group`);
      setGroup(res.data?.data);
    } catch (error) {
      alert(error.message);
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const res = await axiosInstance.get(
        `/group/${groupId}/get-group-expenses`
      );
      setExpenses(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching group expenses:", error.message);
    }
  };



  const addMemberFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/group/${groupId}/add-user`, {
        id: addmember,
      });
      setShowAddMembers(false);
      setAddMember("");
      await fetchGroupDetails();
    } catch (error) {
      alert(error?.response?.data?.message || error.message);
    }
  };

  const calculateUserBalance = () => {
    let totalOwe = 0;
    let totalOwed = 0;

    expenses.forEach((expense) => {
      if (!expense.settleWith) return;

      if (expense.paidBy === currentUserId) {
        expense.settleWith.forEach((p) => {
          totalOwed += p.amount;
        });
      }

      expense.settleWith.forEach((p) => {
        if (p.settlers === currentUserId) {
          totalOwe += p.amount;
        }
      });
    });

    return { totalOwe, totalOwed, net: totalOwed - totalOwe };
  };

  const { totalOwe, totalOwed, net } = calculateUserBalance();

  return (
    <div className="p-4">
      {group && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <div className="text-sm text-gray-600">
                Created: {new Date(group.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
                onClick={() => setShowAddMembers(true)}
              >
                + Add Members
              </button>
              <button
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
                onClick={() => setShowAddExpense(true)}
              >
                Add Expense
              </button>
              <button
                className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded"
                onClick={() => { setmessage(true) }}
              >
                Open Chat
              </button>
            </div>
          </div>

          {/* Balance Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex justify-around items-center">
            <div className="text-center">
              <p className="text-gray-600 text-sm">You Owe</p>
              <p className="text-lg font-bold text-red-600">₹{totalOwe}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">You Are Owed</p>
              <p className="text-lg font-bold text-green-600">₹{totalOwed}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm">Net Balance</p>
              <p
                className={`text-lg font-bold ${net >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {net >= 0 ? `+₹${net}` : `-₹${Math.abs(net)}`}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Expense Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expenses.filter((expense) => expense.status !== "cleared").length ===
          0 && <p className="text-gray-500 col-span-full">No pending expenses.</p>}

        {expenses
          .filter((expense) => expense.status !== "cleared")
          .map((expense) => {
            const remainingAmount = expense.remaining;
            const isPaidByUser = expense.paidBy === currentUserId;
            const userIncluded = expense.settleWith.some(
              (p) => p.settlers === currentUserId
            );

            let relationText = "";

            if (isPaidByUser) {
              const totalFromOthers = expense.settleWith.reduce(
                (sum, s) => sum + s.amount,
                0
              );
              relationText = `Others owe you ₹${totalFromOthers}`;
            } else if (userIncluded) {
              const myShare = expense.settleWith.find(
                (s) => s.settlers === currentUserId
              );
              if (myShare) {
                relationText = `You owe ₹${myShare.amount}`;
              }
            }

            let remainingColor = "text-black";
            if (isPaidByUser) remainingColor = "text-green-600";
            else if (userIncluded) remainingColor = "text-red-600";

            return (
              <div
                key={expense._id}
                onClick={() => navigate(`expenses/${expense._id}`)}
                className="cursor-pointer bg-white rounded-xl shadow-md p-4 border border-gray-200 hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-800">{expense.note}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(expense.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">Paid By: {friends.find(f => f._id === expense.paidBy)?.email.split("@")[0] || "You"}</p>
                <div className="mt-3">
                  <span className="text-gray-700 font-medium">Remaining: </span>
                  <span className={`font-bold ${remainingColor}`}>₹{remainingAmount}</span>
                </div>
                {relationText && (
                  <p className="mt-2 text-sm font-medium text-indigo-600">{relationText}</p>
                )}
              </div>
            );
          })}



      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowAddExpense(false)}
            >
              &times;
            </button>
            <GroupExpenses
              closePopup={() => setShowAddExpense(false)}
              fetchExpenses={fetchGroupExpenses}
            />
          </div>
        </div>
      )}

      {message && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-opacity-20">
          <div className="bg-white rounded-lg p-4 shadow-lg relative w-[85%] max-w-sm max-h-[70vh] overflow-y-auto">
            <button
              className="absolute top-1 right-1 text-gray-500 hover:text-black text-lg"
              onClick={() => setmessage(false)}
            >
              &times;
            </button>
            <Message />
          </div>
        </div>
      )}


      {/* Add Members Modal */}
      {showAddMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md">
            <form onSubmit={addMemberFormSubmit}>
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                onClick={() => setShowAddMembers(false)}
              >
                &times;
              </button>
              <div>
                <label className="block text-sm font-medium mb-1">
                  You can add only those who are your friends.
                </label>
                <select
                  value={addmember}
                  onChange={(e) => setAddMember(e.target.value)}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Select</option>
                  {friends.map((friend) => (
                    <option key={friend._id} value={friend._id}>
                      {friend.email.split("@")[0]}
                    </option>
                  ))}
                </select>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddMembers(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndividualGroup;
