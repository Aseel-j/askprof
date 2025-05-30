import joi from 'joi'; 

//تسجيل الدخول 
export const loginSchema = joi.object({ 
    email:joi.string().email().required(), 
    password: joi.string().min(6).pattern(/(?=.*[A-Z])/).required(),
    });