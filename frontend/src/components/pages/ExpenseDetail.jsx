import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../features/axios";
import { useParams, useNavigate } from "react-router-dom";
import Loading from "../layout/Loading";
import PayButton from "./PayButton";

const ExpenseDetail = () => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [friends, setFriends] = useState([]);
  const [updating, setUpdating] = useState(false);

  const [editingTotal, setEditingTotal] = useState(false);
  const [editingTotalValue, setEditingTotalValue] = useState("");
  const [editingParticipantId, setEditingParticipantId] = useState(null);
  const [editingParticipantValue, setEditingParticipantValue] = useState("");

  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserId, setAddUserId] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState(null);


  const { groupId, expenseId } = useParams();
  const navigate = useNavigate();

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/group/${groupId}/expenses/${expenseId}`);
      setExpense(res.data.data);
      setError("");
    } catch {
      setError("Failed to load expense details");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axiosInstance.get("/user/get-friend");
      
      setFriends(res.data.data || []);
    } catch { }
  };

  const fetchUser = async () => {
    const res = await axiosInstance.get("/user/me");
    setLoggedInUserId(res.data.data._id);
  }

  useEffect(() => {
    fetchExpense();
    fetchFriends();
    fetchUser()
  }, [expenseId]);

  const saveTotalEdit = async () => {
    if (!editingTotalValue || isNaN(editingTotalValue)) {
      alert("Please enter a valid number.");
      return;
    }
    setUpdating(true);
    try {
      await axiosInstance.put(`/group/${groupId}/expenses/${expenseId}`, {
        amount: editingTotalValue,
      });
      await fetchExpense();
      setEditingTotal(false);
      setEditingTotalValue("");
      setError("");
    } catch {
      setError("Failed to save changes");
    } finally {
      setUpdating(false);
    }
  };

  const saveParticipantEdit = async () => {
    if (!editingParticipantValue || isNaN(editingParticipantValue)) {
      alert("Please enter a valid number.");
      return;
    }
    setUpdating(true);
    try {
      await axiosInstance.put(`/group/${groupId}/expenses/${expenseId}`, {
        amount: editingParticipantValue,
        changeId: editingParticipantId._id,
      });
      await fetchExpense();
      setEditingParticipantId(null);
      setEditingParticipantValue("");
      setError("");
    } catch {
      setError("Failed to save changes");
    } finally {
      setUpdating(false);
    }
  };

  const markCleared = async (userId) => {
    try {
      setUpdating(true);
      await axiosInstance.patch(`/group/${groupId}/expenses/${expenseId}/settle`, { userId });
      await fetchExpense();
      setError("");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update payment status");
    } finally {
      setUpdating(false);
    }
  };

  const removeUser = async (userId) => {
    try {
      setUpdating(true);
      await axiosInstance.patch(`/group/${groupId}/expenses/${expenseId}/remove-user`, { userId });
      await fetchExpense();
      setError("");
    } catch {
      setError("Failed to remove user");
    } finally {
      setUpdating(false);
    }
  };

  const addUser = async () => {
    if (!addUserId) return;
    try {
      setUpdating(true);
      await axiosInstance.post(`/group/${groupId}/expenses/${expenseId}/add-user`, { userId: addUserId });
      setAddUserId("");
      setShowAddUser(false);
      await fetchExpense();
      setError("");
    } catch {
      setError("Failed to add user");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500 mb-4">{error}</div>;
  if (!expense) return null;

  
  const paidByUser = friends.find(f => f._id === expense.paidBy._id) || { email: "You" };
  const paidByUsername = paidByUser.email.split("@")[0];
  

  return (
    <div className="p-6 bg-white rounded shadow max-w-2xl mx-auto">
      <button onClick={() => navigate(`/splitwise/group/${groupId}`)} className="mb-4 text-blue-600 hover:underline">
        &larr; Back
      </button>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">{expense.note}</h2>



        {expense.paidBy._id !== loggedInUserId && <PayButton
          friendUpiId={expense.paidBy.upid}
          amount={expense.remaining}
          isId={!!expense.paidBy.upid}
          confirmFunction={() => markCleared(expense.paidBy._id)}
        />}

      </div>


      <div className="mb-4 flex justify-between items-center">
        {expense.equal && !editingTotal && (
          <button
            onClick={() => { setEditingTotal(true); setEditingTotalValue(expense.totalAmount); }}
            className="text-blue-600 hover:underline text-sm"
          >
            Edit Amount
          </button>
        )}
      </div>

      {editingTotal && (
        <div className="mb-4">
          <input
            type="number"
            value={editingTotalValue}
            onChange={(e) => setEditingTotalValue(e.target.value)}
            className="border p-2 rounded w-full mb-2"
            min={0}
          />
          <button onClick={saveTotalEdit} disabled={updating} className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700 mr-2">
            Save
          </button>
          <button onClick={() => setEditingTotal(false)} disabled={updating} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
        </div>
      )}

      <p className="mb-4 text-gray-700 font-semibold">Total Amount Remaining: ₹{expense.remaining}</p>
      <p className="mb-4 text-gray-500 text-sm">Created: {new Date(expense.createdAt).toLocaleDateString()}</p>
      <p className="mb-4 text-gray-600 font-medium">Paid By: {paidByUsername}</p>

      <h3 className="text-lg font-semibold mb-2">Participants:</h3>
      <ul className="mb-4 space-y-3">
        {expense.settleWith?.map((participant) => {
          const username = participant.settlers ? participant.settlers.email.split("@")[0] : "Unknown";
          const isEditingThisUser = editingParticipantId === participant.settlers;
          return (
            <li key={participant._id} className="flex items-center justify-between border p-3 rounded shadow-sm">
              <div>
                <p className="font-medium">{username}</p>
                <p className="text-sm text-gray-600">Share: ₹{participant.amount}</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Per-participant edit only for unequal splits */}
                {!expense.equal && (isEditingThisUser ? (
                  <>
                    <input
                      type="number"
                      value={editingParticipantValue}
                      onChange={(e) => setEditingParticipantValue(e.target.value)}
                      className="border p-1 rounded w-20 text-sm"
                      min={0}
                    />
                    <button onClick={saveParticipantEdit} disabled={updating} className="bg-green-600 px-3 py-1 text-white rounded hover:bg-green-700">
                      Save
                    </button>
                    <button onClick={() => setEditingParticipantId(null)} disabled={updating} className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingParticipantId(participant.settlers); setEditingParticipantValue(participant.amount); }}
                    className="text-blue-600 hover:text-blue-800"
                    title="Edit amount"
                  >
                    &#9998;
                  </button>
                ))}
                {participant.cleared ? (
                  <span className="text-green-600 font-semibold">Cleared</span>
                ) : (
                  <button
                    onClick={() => markCleared(participant.settlers._id)}
                    disabled={updating}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => removeUser(participant.settlers)}
                  disabled={updating}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {expense.clearedBy && expense.clearedBy.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mb-2">Cleared By:</h3>
          <ul className="mb-4 space-y-3">
            {expense.clearedBy.map((clearedUser) => {
              const user = friends.find(f => f._id === clearedUser.user) || { email: "You" };
              const username = user.email.split("@")[0];
              return (
                <li key={clearedUser.user} className="border p-3 rounded shadow-sm">
                  <p>
                    <span className="font-medium">{username}</span> cleared ₹{clearedUser.amount} on {new Date(clearedUser.when).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {showAddUser ? (
        <div className="flex space-x-2 items-center mb-4">
          <select
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            className="border p-2 rounded flex-grow"
          >
            <option value="">Select a user to add</option>
            {friends.filter((f) => !expense.settleWith?.some((p) => p.settlers === f._id)).map((f) => (
              <option key={f._id} value={f._id}>
                {f.email.split("@")[0]}
              </option>
            ))}
          </select>
          <button onClick={addUser} disabled={!addUserId || updating} className="bg-green-600 px-4 py-2 text-white rounded hover:bg-green-700">
            Add
          </button>
          <button onClick={() => setShowAddUser(false)} disabled={updating} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAddUser(true)} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Add Participant
        </button>
      )}

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
};

export default ExpenseDetail;
