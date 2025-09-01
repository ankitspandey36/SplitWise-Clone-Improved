import { useEffect, useState } from "react";
import { axiosInstance } from "../../features/axios";


const AddExpense = ({ closePopup, fetchExpenses }) => {
    const [friends, setFriends] = useState([]);
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [paidBy, setPaidBy] = useState("me");
    const [settleWith, setSettleWith] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const res = await axiosInstance.get("/user/get-friend");
            const data = res.data?.data;
            if (Array.isArray(data)) {
                setFriends(data);
            }

            else {
                setFriends([]);
            };
        })()
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (paidBy === settleWith) {
            setError("Payer and Receiver can't be the same.");
            return;
        }
        try {
            const res = await axiosInstance.get("/user/me");
            const userId = res.data.data._id;

            if (paidBy == "me") {
                await axiosInstance.post("/expense/add-expense", { paidBy: userId, amount, settleWith, note })
            }
            else {
                await axiosInstance.post("/expense/add-expense", { paidBy, amount, settleWith: userId, note })
            }

            fetchExpenses();
        } catch (error) {
            console.log(error?.response?.data?.message);
        }
        finally {
            closePopup()
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Add Expense</h2>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <input
                type="number"
                placeholder="Amount"
                className="w-full border rounded p-2"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
            />

            <input
                type="text"
                placeholder="note"
                className="w-full border rounded p-2"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                required
            />

            <div>
                <label className="block text-sm font-medium">Paid By</label>
                <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                >
                    <option value="me">Me</option>
                    {friends.map((friend) => (
                        <option key={friend._id} value={friend._id}>
                            {friend.email.split('@')[0]}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Settle With</label>
                <select
                    value={settleWith}
                    onChange={(e) => setSettleWith(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                >
                    <option value="">-- Select --</option>
                    <option value="me">Me</option>
                    {friends.map((friend) => (
                        <option key={friend._id} value={friend._id}>
                            {friend.email.split('@')[0]}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex justify-end gap-4">
                <button
                    type="button"
                    onClick={closePopup}
                    className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Add
                </button>
            </div>
        </form>
    );
};

export default AddExpense;
