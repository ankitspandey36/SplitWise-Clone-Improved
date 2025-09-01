import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../features/axios.js";

function Activity() {
  const [ungroupedExpenses, setUngroupedExpenses] = useState([]);
  const [groupedExpenses, setGroupedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [ungroupedRes, groupedRes] = await Promise.all([
        axiosInstance.get("/expense/get-every-expense"),
        axiosInstance.get("/group/activity")
      ]);

      setUngroupedExpenses(ungroupedRes.data.data || []);
      setGroupedExpenses(groupedRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Activity</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (ungroupedExpenses.length === 0 && groupedExpenses.length === 0) ? (
        <p>No transactions found.</p>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-2">Ungrouped Expenses</h3>
          <ul className="space-y-4 mb-6">
            {ungroupedExpenses.map(txn => (
              <li key={txn._id} className="border p-4 rounded-md shadow-md bg-white">
                <p><strong>Paid By:</strong> {txn.paidBy?.email.split('@')[0] || "Unknown"}</p>
                <p><strong>Amount:</strong> ₹{txn.amount}</p>
                <p><strong>Note:</strong> {txn.note}</p>
                <p className="text-sm text-gray-500"><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {txn.status || "notcleared"}</p>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-semibold mb-2">Grouped Expenses</h3>
          {groupedExpenses.length === 0 ? (
            <p>No grouped transactions found.</p>
          ) : (
            groupedExpenses.map(group => (
              <div key={group._id} className="mb-6">
                <h4 className="font-semibold">{group.name}</h4>
                <ul className="space-y-4">
                  {group.expenses.map(txn => (
                    <li key={txn._id} className="border p-4 rounded-md shadow-md bg-white">
                      <p><strong>Paid By:</strong> {txn.paidBy?.email.split('@')[0] || "Unknown"}</p>
                      <p><strong>Amount:</strong> ₹{txn.totalAmount ?? txn.amount}</p>
                      <p><strong>Note:</strong> {txn.note}</p>
                      <p className="text-sm text-gray-500"><strong>Date:</strong> {new Date(txn.createdAt).toLocaleString()}</p>
                      <p className="text-sm text-gray-600"><strong>Status:</strong> {txn.status || "notcleared"}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default Activity;
