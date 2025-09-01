import mongoose from "mongoose";


export const groupExpense = new mongoose.Schema({
    paidBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    settleWith: [
        {
            settlers: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            amount: {
                type:Number,
            }
        }],
    note: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["cleared", "notcleared"],
        default: "notcleared"
    },
    clearedBy: [{
        _id: false,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        when: {
            type: Date
        },
        amount: {
            type: Number,
            default:0
        }
    }],
    equal: {
        type: Boolean,
        default:true //if equal then true
    },    
    remaining: {
        type: Number,
        default:0
    },
    totalAmount: {
        type: Number,
        default:0
    }
    

}, { timestamps: true })
