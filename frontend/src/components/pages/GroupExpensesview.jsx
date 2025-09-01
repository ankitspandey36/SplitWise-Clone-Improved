import { useEffect, useState } from "react";
import { axiosInstance } from "../../features/axios";
import { useParams } from "react-router-dom";

const GroupExpenses = ({ closePopup, fetchExpenses }) => {
    const { groupId } = useParams();
    const [members, setMembers] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [expenseType, setExpenseType] = useState("equal");
    const [paidBy, setPaidBy] = useState("me");
    const [selected, setSelected] = useState({});
    const [amounts, setAmounts] = useState({});
    const [totalAmount, setTotalAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            const res = await axiosInstance.get(`/group/${groupId}/get-members`);
            setMembers(res.data?.data || []);
        })();

        (async () => {
            const res = await axiosInstance.get("/user/me");
            setCurrentUserId(res.data?.data?._id);
        })();
    }, [groupId]);

    const handleCheckboxChange = (id, checked) => {
        setSelected((prev) => ({ ...prev, [id]: checked }));

        if (!checked) {
            setAmounts((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }
    };

    const handleAmountChange = (id, value) => {
        setAmounts((prev) => ({ ...prev, [id]: Number(value) }));
    };

    useEffect(() => {
        if (expenseType === "unequal") {
            const sum = Object.entries(selected)
                .filter(([id, checked]) => checked)
                .reduce((acc, [id]) => acc + (Number(amounts[id]) || 0), 0);
            setTotalAmount(sum);
        }
    }, [amounts, selected, expenseType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const payerId = paidBy === "me" ? currentUserId : paidBy;

        let settleWithData = [];

        if (expenseType === "equal") {
            const chosen = Object.entries(selected)
                .filter(([_, v]) => v)
                .map(([id]) => id);
            if (!totalAmount || chosen.length === 0) {
                setError("Please enter amount and select at least one member.");
                return;
            }
            const perPerson = (Number(totalAmount) / chosen.length).toFixed(2);
            settleWithData = chosen.map((id) => ({
                id: id === "me" ? currentUserId : id,
                amount: perPerson,
            }));
        } else {
            const chosen = Object.entries(selected)
                .filter(([_, v]) => v)
                .map(([id]) => id);
            if (chosen.some((id) => !amounts[id])) {
                setError("Please enter amounts for all selected members.");
                return;
            }
            settleWithData = chosen.map((id) => ({
                id: id === "me" ? currentUserId : id,
                amount: amounts[id],
            }));
        }

        try {
            await axiosInstance.post(`/group/${groupId}/add-expense`, {
                paidBy: payerId,
                settleWith: settleWithData,
                amount:
                    expenseType === "equal"
                        ? totalAmount
                        : settleWithData.reduce((sum, p) => sum + Number(p.amount), 0),
                note,
                equal: expenseType === "equal", 
            });

            fetchExpenses();
            closePopup();
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to add expense.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-[9999]">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md max-h-[85vh] overflow-y-auto mx-auto p-4 bg-white border rounded-lg shadow-xl space-y-4 relative"
            >
                <h2 className="text-lg font-bold text-center">Add Expense</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                {/* Expense type toggle */}
                <div className="flex gap-4 justify-center">
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="radio"
                            name="expenseType"
                            value="equal"
                            checked={expenseType === "equal"}
                            onChange={() => {
                                setExpenseType("equal");
                                setAmounts({});
                            }}
                        />
                        Equal
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                        <input
                            type="radio"
                            name="expenseType"
                            value="unequal"
                            checked={expenseType === "unequal"}
                            onChange={() => {
                                setExpenseType("unequal");
                                setAmounts({});
                            }}
                        />
                        Unequal
                    </label>
                </div>

                <input
                    type="text"
                    placeholder="Note"
                    className="w-full p-2 border rounded text-sm"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                />

                {/* Paid By */}
                <div>
                    <label className="block mb-1 font-medium">Paid By</label>
                    <select
                        value={paidBy}
                        onChange={(e) => setPaidBy(e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                    >
                        <option value="me">Me</option>
                        {members
                            .filter((m) => m._id !== currentUserId) // exclude current user from list
                            .map((m) => (
                                <option key={m._id} value={m._id}>
                                    {m.email.split("@")[0]}
                                </option>
                            ))}
                    </select>

                </div>

                {/* Equal: total amount */}
                {expenseType === "equal" && (
                    <input
                        type="number"
                        placeholder="Total Amount"
                        className="w-full p-2 border rounded text-sm"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        required
                    />
                )}


                {/* Members as checkboxes */}
                <div className="max-h-40 overflow-y-auto space-y-2">
                    {members
                        .filter((m) => !(expenseType === "unequal" && m._id === currentUserId)) // exclude current user if expenseType is unequal
                        .map((m) => {
                            const id = m._id === currentUserId ? "me" : m._id;
                            return (
                                <label
                                    key={id}
                                    className="flex items-center justify-between p-2 cursor-pointer transition hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id={`member-${id}`}
                                            checked={!!selected[id]}
                                            onChange={(e) => handleCheckboxChange(id, e.target.checked)}
                                            className="peer hidden"
                                        />
                                        <span className="w-5 h-5 flex items-center justify-center border-2 border-gray-400 rounded-full peer-checked:bg-blue-600 peer-checked:border-blue-600 text-white text-xs">
                                            {selected[id] ? "✓" : ""}
                                        </span>
                                        <span className="text-sm text-gray-700">
                                            {id === "me" ? "Me" : m.email.split("@")[0]}
                                        </span>
                                    </div>

                                    {expenseType === "unequal" && selected[id] && (
                                        <input
                                            type="number"
                                            placeholder="Amount"
                                            value={amounts[id] || ""}
                                            onChange={(e) => handleAmountChange(id, e.target.value)}
                                            className="p-1 border rounded w-20 text-sm"
                                        />
                                    )}
                                </label>
                            );
                        })}
                </div>





                <div className="flex justify-end gap-2  sticky bottom-0 bg-white border-t pt-3">
                    <button
                        type="button"
                        onClick={closePopup}
                        className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default GroupExpenses;
