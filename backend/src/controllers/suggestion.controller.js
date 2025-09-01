import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Suggestion } from "../model/suggestion.model.js";

const setSuggestion = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { suggestion } = req.body
    console.log(suggestion);
    
    if (!suggestion) throw new apiError(400, "Suggestion is required");
    await Suggestion.create({
        userId, suggestion,when:Date.now()
    });

    return res.status(200).json(new apiResponse(200, null, "Suggestion send succesfully"));

})


export { setSuggestion }