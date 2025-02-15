// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import {User} from '../model/users.js'
import {AsyncHandler} from '../utils/AsyncHandler.js'
import { ApiError } from '../utils/ApiError.js';

export const verifyToken =AsyncHandler( async (req, res, next) => { 
  try {
    const token = req.cookies?.accessToken  || req.header("Authorization")?.replace("Bearer ", "")
    ;
    console.log("1",req.cookies);
    
    
    console.log("hello",token);
    
    if (!token) {
        // throw new ApiError(401, "Unauthorized request")
        return res
        .status(401)
        .json(new ApiResponse(401, "Invalid user credentials"));

    }

    const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
    console.log(verifyUser)

    const user = await User.findOne({ _id: verifyUser.userId }).select({ password: 0, refreshToken: 0 });
    if (!user) {
            
        return res
        .status(401)
        .json(new ApiResponse(401, "Invalid Access Token"));

    }
    // console.log(user)
        req.userData = user // Exclude sensitive data like password
        next();
    
} catch (error) {
    console.log(error)
throw new ApiError(401, error?.message || "Invalid access token")

    
}

});
