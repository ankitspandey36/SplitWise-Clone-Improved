import mongoose from 'mongoose';

const expenseSchema = mongoose.Schema({
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    settleWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    note: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["cleared", "notcleared"],
        default: "notcleared"
    },
    
}, { timestamps: true })

export const Expense = mongoose.model("Expense", expenseSchema);