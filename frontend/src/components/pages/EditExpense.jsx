import { useState } from "react";

const EditExpense = ({ onSubmitExpense, onClose, editingExpense, fetchExpenses }) => {
  const [settleAmount, setSettleAmount] = useState("");

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg relative w-[90%] max-w-md">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-semibold mb-4">Settle Expense</h2>

        <p className="mb-2 text-sm text-gray-600">
          Current remaining amount: ₹{editingExpense?.amount}
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!settleAmount || isNaN(settleAmount)) return;
            await onSubmitExpense(editingExpense, Number(settleAmount));
            await fetchExpenses()
            onClose()
          }}
          className="space-y-4"
        >
          <input
            type="number"
            className="w-full border p-2 rounded"
            placeholder="Enter amount to settle "
            value={settleAmount}
            onChange={(e) => setSettleAmount(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Settle
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditExpense;
