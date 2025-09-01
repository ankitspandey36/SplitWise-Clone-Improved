import React, { useEffect, useState } from 'react';
import AddFriend from './AddFriend';
import Loading from '../layout/Loading';
import AddExpense from './AddExpense';
import EditExpense from './EditExpense';
import { axiosInstance } from '../../features/axios';
import PayButton from './PayButton';

const UngroupedExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [user, setUser] = useState()


  useEffect(() => {
    (async () => {
      const res = await axiosInstance.get("/user/me");
      setUser(res.data.data)
    })();
  }, []);




  const fetchExpenses = async () => {
    try {
      const exp = await axiosInstance.get("/expense/get-expense")

      setExpenses(exp.data.data)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, []);

  const handleEditExpense = async (id, amt) => {
    try {
      await axiosInstance.post("/expense/settle-expense", { amount: amt, expenseId: id })
    } catch (error) {
      alert("Expense not edited.")
    }
  };

  const handleSettle = async (id) => {
    await axiosInstance.post("/expense/delete-expense", { expenseId: id })
    await fetchExpenses();
  };

  let toGive = 0;
  let toReceive = 0;
  expenses.forEach((exp) => {
    if (exp.paidBy._id === user._id) toReceive += exp.amount;
    else toGive += exp.amount;
  });


  if (!user) return <Loading />;



  return (
    <div className="h-[calc(100vh-150px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Ungrouped Expenses</h2>
        <div className="space-x-2">
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + Add Expense
          </button>
          <button
            onClick={() => setShowAddFriend(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            + Add Friend
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading ? (
          <h1>Loading...</h1>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500">No ungrouped expenses.</p>
        ) : (
          <>
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="flex justify-between items-center p-4 bg-gray-50 border rounded-lg shadow-sm"
              >
                <div>
                  <p className="font-medium">{expense.note}</p>
                  <p className="text-sm text-gray-600">
                    Paid by: {expense.paidBy.email.split('@')[0]}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${expense.paidBy._id === user._id ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    ₹{expense.amount}
                  </p>
                  <div className="text-xs text-blue-600 mt-1 space-x-2 flex items-center justify-end">
                    <button onClick={() => setEditingExpenseId(expense._id)}>Edit</button>
                    <button onClick={() => handleSettle(expense._id)}>Settle</button>

                    {expense.paidBy._id !== user._id && (
                      <PayButton
                        friendUpiId={expense.paidBy.upid}
                        amount={expense.amount}
                        isId={!!expense.paidBy.upid} 
                        confirmFunction={() => handleSettle(expense._id)}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}


            <div className="bg-white p-4 border rounded-lg shadow text-sm">
              <p className="text-gray-800 mb-1">
                <span className="font-medium">You will receive:</span>{' '}
                <span className="text-green-600 font-semibold">₹{toReceive}</span>
              </p>
              <p className="text-gray-800">
                <span className="font-medium">You have to pay:</span>{' '}
                <span className="text-red-600 font-semibold">₹{toGive}</span>
              </p>
            </div>
          </>
        )}
      </div>

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


      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">

          <div className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              onClick={() => setShowAddExpense(false)}
            >
              &times;
            </button>
            <AddExpense closePopup={() => setShowAddExpense(false)} fetchExpenses={fetchExpenses} />
          </div>
        </div>
      )}

      {editingExpenseId && (
        <EditExpense
          editingExpense={editingExpenseId}
          onSubmitExpense={handleEditExpense}
          onClose={() => setEditingExpenseId(null)}
          fetchExpenses={fetchExpenses}
        />
      )}
    </div>
  );
};

export default UngroupedExpenses;
