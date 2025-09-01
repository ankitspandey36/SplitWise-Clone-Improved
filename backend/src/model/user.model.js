import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyCode: {
        type: Number,
    },
    refreshToken: {
        type: String
    },
    expiresAt: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    balance: {
        type: Number,
        default:0
    },
    upid: {
        type: String,
    }
}, { timestamps: true })

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        id: this._id,
        email: this.email
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})
userSchema.methods.checkPassword = async function (password) {
    console.log(this.password);
    
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", userSchema);