import mongoose from "mongoose";

export const messageSchema = mongoose.Schema({
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String
    }
}, { timestamps: true })