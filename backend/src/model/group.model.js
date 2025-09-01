import mongoose from "mongoose";
import { groupExpense } from "./groupExpenses.js";
import { messageSchema } from "./message.model.js";
const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    expenses: [groupExpense],    
    messages: [messageSchema]

}, { timestamps: true })                            

export const Group = mongoose.model("Group", groupSchema)