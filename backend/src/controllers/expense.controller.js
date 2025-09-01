import { Expense } from "../model/expenses.model.js";
import { User } from "../model/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";

const addExpense = asyncHandler(async (req, res) => {

    const { amount, paidBy, settleWith, note } = req.body
    if (!amount || !paidBy || !settleWith || !note) {
        throw new apiError(400, "Data is missing.")
    }

    let amt = Number(amount)

    const paid = await User.findById(paidBy);
    paid.balance = Number(paid.balance) + amt;
    await paid.save();
    const settle = await User.findById(settleWith);
    settle.balance = Number(settle.balance) - amt;
    await settle.save();

    const expense = await Expense.create({
        amount,
        paidBy,
        settleWith,
        note,
        
    });

    return res.status(200).json(new apiResponse(200, expense, "Expense Created Succesfully."))
})

const settleExpense = asyncHandler(async (req, res) => {
    const { expenseId, amount } = req.body;
    console.log("Expense", amount);

    if (!expenseId || amount === undefined) {
        throw new apiError(400, "Expense ID and amount are required.");
    }
    const user = req.user;
    const expense = await Expense.findById
        (expenseId);
    const amt = Number(amount);
    if (!expense) {
        throw new apiError(400, "Expense Not Found.")
    }
    expense.amount = amt;
    if (expense.amount <= 0) {
        expense.amount = 0;
        expense.status = "cleared"
    }
    await expense.save();

    return res.status(200).json(new apiResponse(200, null, "Expenses Updated."))

})

const deleteExpense = asyncHandler(async (req, res) => {
    const { expenseId } = req.body
    const expense = await Expense.findById(expenseId);
    expense.status = "cleared";
    await expense.save();
    return res.status(200).json(new apiResponse(200, null, "Expense Deleted Succesfully."))
})

const getAllExpenses = asyncHandler(async (req, res) => {
    const user = req.user;
    const expenses = await Expense.find({
        $or: [
            { paidBy: user._id },
            { settleWith: user._id }
        ],
        status: "notcleared"
    })
        .sort({ createdAt: -1 }).populate("paidBy", "email upid");

    return res.status(200).json(new apiResponse(200, expenses, "Expenses fetched successfully"));
})

const getEveryExpense = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const expenses = await Expense.find({
        $or: [
            { paidBy: userId },
            { settleWith: userId }
        ],
    })
        .sort({ createdAt: -1 }).populate("paidBy", "email");

    return res.status(200).json(new apiResponse(200, expenses, "Expenses fetched successfully"));
})



export { addExpense, settleExpense, deleteExpense, getAllExpenses, getEveryExpense }