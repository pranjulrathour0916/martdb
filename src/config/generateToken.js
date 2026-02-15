import jwt from 'jsonwebtoken'
import 'dotenv/config'


export const generateAccessToken = (user) => {

    return jwt.sign(
        {id : user.id},
        process.env.JWT_SECRET_KEY,
        {expiresIn : "15m"}
    )
}

export const generateRefreshToken = (user) => {
    return jwt.sign(
        {id : user.id},
        process.env.JWT_SECRET_KEY,
        {expiresIn : "7d"}
    )
}

