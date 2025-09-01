import mongoose from "mongoose";

const suggestionSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    suggestion: {
        type:String
    },
    when: {
        type:Date
    }
})

export const Suggestion = mongoose.model("Suggestion", suggestionSchema);