import joi from 'joi';
//تعديل بيانات المهني
export const updateProfessionalProfileSchema = joi.object({
  username: joi.string().min(3).max(20).optional(),
  bio: joi.string().max(500).optional(),
  governorate: joi.string().optional(), 
  city: joi.string().max(50).optional(),
  professionField: joi.string().optional(), 
  anotheremail: joi.string().email().optional(),
  phoneNumber: joi.string().pattern(/^\+(970|972)[0-9]{7,10}$/).optional()
});

//تعديل نبذة عن المهني
export const updateDescriptionSchema = joi.object({
  description: joi.string().min(3).max(500).required().trim().messages({
    'string.base': 'الوصف يجب أن يكون نصًا',
    'string.empty': 'الوصف مطلوب',
    'string.min': 'الوصف يجب أن يكون على الأقل 3 أحرف',
    'string.max': 'الوصف لا يجب أن يتجاوز 500 حرف'
  })
});
//تعديل المحافظة
export const updateGovernorateSchema = joi.object({
  governorate: joi.string().min(2).required().messages({
    "string.base": "اسم المحافظة يجب أن يكون نصًا",
    "string.empty": "اسم المحافظة مطلوب",
    "string.min": "اسم المحافظة يجب أن يحتوي على حرفين على الأقل",
    "any.required": "حقل اسم المحافظة مطلوب"
  })
});