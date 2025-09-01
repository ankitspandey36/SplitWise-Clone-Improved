import { apiError } from "../utils/apiError.js";
import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from "../model/user.model.js";
import jwt from 'jsonwebtoken';
import { verificationEmail } from "../utils/sendMail.js";


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new apiError(400, "User not Found")
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new apiError(400, "Token generation unsuccessful.")
    }
}


const signUp = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new apiError(400, "Email or password is Missing");
    const user = await User.findOne({ email });
    if (user && user.isVerified) return res.json(new apiResponse(400, "User already registered."))
    if (user && !user.isVerified) await User.findByIdAndDelete(user._id)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newUser = await User.create({
        email, password, verifyCode, expiresAt: Date.now() + 10 * 60 * 1000
    })

    const signUpdetails = await User.findById(newUser._id).select("-password")
    await verificationEmail(email, verifyCode)
    return res.status(200).json(new apiResponse(200, signUpdetails, "User Signed Up Successfully"));
})

const verification = asyncHandler(async (req, res) => {
    const { email, code } = req.body
    if (!email || !code) throw new apiError(400, "Email or Code not found")
    // console.log("email", email);


    const user = await User.findOne({ email });
    if (!user) {
        await User.deleteOne({ email });
        throw new apiError(400, "User not found");
    }
    if (user.expiresAt < Date.now()) throw new apiError(400, "Code Expired.")
    console.log("Vcode", user.verifyCode);
    console.log("code", code);

    if (String(user.verifyCode) !== String(code)) throw new apiError(400, "Code verification unsuccessfull");
    user.verifyCode = null;
    user.expiresAt = null;
    user.isVerified = true;
    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new apiResponse(200, null, "Code verification successfull."))
})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw new apiError(400, "Email or Password is missing");
    const user = await User.findOne({ email });
    if (!user) throw new apiError(400, "User not found while login.")
    console.log(password);

    const check = await user.checkPassword(password);
    if (!check) throw new apiError(400, "Incorrect Password");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);
    const data = await User.findById(user._id).select("-password");


    res.cookie("refreshToken", refreshToken, options).cookie("accessToken", accessToken, options).json(new apiResponse(200, data, "Login Successful"))

})

const logout = asyncHandler(async (req, res) => {

    const user = req.user;
    console.log("user", user);


    await User.findByIdAndUpdate(user._id, {
        $set: { refreshToken: undefined }
    }, { new: true })
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }
    res.clearCookie("refreshToken", options).clearCookie("accessToken", options).json(new apiResponse(200, "Logged Out successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) throw new apiError(400, "User not found.");
    res.status(200).json(new apiResponse(200, user, "Profile fetched"));
})

const refresh = asyncHandler(async (req, res) => {
    const check = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!check) {
        return res.status(401).json({ success: false, message: "No refresh token. Please login again." });
    }
    const decode = await jwt.verify(check, process.env.REFRESH_TOKEN_SECRET);


    const user = await User.findById(decode.id);
    if (!user) throw new apiError(400, "Can't refresh please login again");

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const option = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    }

    return res.status(200).cookie("accessToken", accessToken, option).cookie("refreshToken", refreshToken, option).json(new apiResponse(200, { accessToken, refreshToken }, "acces token refreshed"))
})

const resendCode = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email });
    if (!user) throw new apiError(400, "User Not Found")
    const vcode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyCode = vcode;
    await user.save({ validateBeforeSave: false });
    await verificationEmail(email, vcode);
    return res.status(200).json(new apiResponse(200, "Verified Code Sent."));

})


const forgotpasswordVerification = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email }).select("-password -refreshToken");
    if (!user) throw new apiError(400, "User not found");
    const vcode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyCode = vcode;
    user.expiresAt = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    await verificationEmail(email, vcode);
    return res.status(200).json(new apiResponse(200, "Verified Code Sent."));
})


const forgotpasswordchange = asyncHandler(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body
    console.log("email", email);

    if (newPassword != confirmPassword) throw new apiError(400, "New and confirm password doesn't match")
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) throw new apiError(400, "User not found.");
    user.password = newPassword;
    await user.save();
    return res.status(200).json(new apiResponse(200, "Password Changed Successfully."));
})




const verifyForgotCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body
    const user = await User.findOne({ email });
    if (!user) throw new apiError(400, "User not found.")
    if (user.codeexpiresAt < Date.now()) {

        throw new apiError(400, "Code expired. Please register again.");
    }
    const checkcode = user.verifyCode;
    if (String(checkcode) !== String(code)) throw new apiError(400, "Invalid Code.")
    user.code = null;
    user.codeexpiresAt = null;

    await user.save({ validateBeforeSave: false });
    return res.status(200).json(new apiResponse(200, "Code Verified."));
})

const getUserId = asyncHandler(async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email });
    return res.status(200).json(new apiResponse(200, user._id, "User Id fetched succesfully."));
})

const addFriend = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = req.user
    if (!email) throw new apiError(400, "Email not Found");
    const friendToBeAdded = await User.findOne({ email });
    if (!friendToBeAdded) {
        throw new apiError(404, "User with this email does not exist.");
    }
    console.log("user", user);
    console.log("email", email);

    if (friendToBeAdded._id.equals(user._id)) {
        throw new apiError(400, "You cannot add yourself as a friend.");
    }
    const alreadyFriend = user.friends.some(id => id.equals(friendToBeAdded._id));
    if (alreadyFriend) {
        throw new apiError(400, "User is already your friend.");
    }
    user.friends.push(friendToBeAdded._id);
    await user.save({ validateBeforeSave: false });
    friendToBeAdded.friends.push(user._id);
    await friendToBeAdded.save({ validateBeforeSave: false });
    return res.status(200).json(new apiResponse(200, null, "Friend Added."));
})

const getFriend = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('friends', 'email');
    return res.status(200).json(new apiResponse(200, user.friends, "Friends fetched successfully"));
})


const getUserUpi = asyncHandler(async (req, res) => {
    const { userId } = req.body
    const user = await User.findById(userId);
    if (!user) throw new apiError(400, "User Not Found");
    return res.status(200).json(new apiResponse(200, user.upid, "Upi id fetched successfully"));
})

const updateUpiId = asyncHandler(async (req, res) => {
    const { upid } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);    
    user.upid = upid;
    await user.save();
    return res.status(200).json(new apiResponse(200,null,"Upi id updated.") )
})



export { signUp, login, logout, getCurrentUser, refresh, verification, resendCode, verifyForgotCode, forgotpasswordchange, forgotpasswordVerification, getUserId, addFriend, getFriend, getUserUpi, updateUpiId };
