import jwt from 'jsonwebtoken';
import { apiError } from '../utils/apiError.js'
import { User } from '../model/user.model.js'

const verifyjwt = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
        const token = req.cookies?.accessToken || bearerToken;

        if (!token) throw new apiError(404, "Missing Token");
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) throw new apiError(400, "User Not Found.")
        req.user = user;
        // console.log("user",user);        
        next();
    } catch (error) {
        next(error)
    }
}

export { verifyjwt }