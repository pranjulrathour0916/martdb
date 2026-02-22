import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const authenticateUser = async(req, res, next) => {
    try {
        const token = req.headers.authtoken;
    if(!token)
        return res.status(401).json({message : "no token found"});

    const user =  jwt.verify(token,process.env.JWT_SECRET_KEY)
    req.user = user
    console.log("user verified",user)
    next()
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

