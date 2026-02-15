import Joi from 'joi';
import { Result } from 'pg';

const signUpSchema = Joi.object({
    name : Joi.string().min(3).max(50).required(),
    phone: Joi.number().min(10).required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(5).required()
});

export const validateSignUP=(req, res, next)=>{
    const {error} = signUpSchema.validate(req.body, {abortEarly: false})
    if(error)
    {
        const errorMessage = error.details.map(detail => detail.message).join(',');
        return res.status(400).json({ error: errorMessage });
    }
    next();
}

const loginSchema = Joi.object({
    phone : Joi.number().required(),
    password : Joi.string().min(5).required()

})

export const validateLogin = (req, res, next) =>{
    const {error} = loginSchema.validate(req.body, {abortEarly : false})
    if(error)
        {
            const errorMessage = error.details.map(detail => detail.message).join(',');
            return res.status(400).json({error : errorMessage});
        }


    next();
}