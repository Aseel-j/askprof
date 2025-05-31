import joi from 'joi'; 
//انشاء الحساب 
export const registerSchema = joi.object({ 
    username: joi.string().min(3).max(20).required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).pattern(/(?=.*[A-Z])/).required(),
    phoneNumber: joi.string().pattern(/^\+(970|972)[0-9]{7,10}$/).required(),
    birthdate: joi.date().required(),
    gender: joi.string().valid("ذكر", "أنثى").required(),
    usertype: joi.string().valid("مستخدم", "مهني").required(),
    professionField: joi.string()
      .valid("التكنولوجيا", "الكهربائيات", "ورشات البناء")
      .when('usertype', {
        is: "مهني",
        then: joi.required(),
        otherwise: joi.forbidden()
      })
  });
//تسجيل الدخول 
export const loginSchema = joi.object({ 
    email:joi.string().email().required(), 
    password: joi.string().min(6).pattern(/(?=.*[A-Z])/).required(),
    });
//ارسال الكود
export const SendCodeSchema = joi.object({ 
    email:joi.string().email().required(), 
     
    });
//تغيير كلمة المرور 
export const resetPasswordSchema = joi.object({ 
    email:joi.string().email().required(), 
    password: joi.string().min(6).pattern(/(?=.*[A-Z])/).required(),
    code: joi.string().length(6).required(),
    });
    
