import joi from 'joi';
//تعديل بيانات المهني
export const updateProfessionalProfileSchema = joi.object({
  username: joi.string().min(3).max(20).optional(),
  bio: joi.string().max(500).optional(),
  governorate: joi.string().optional(), 
  city: joi.string().max(50).optional(),
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
// اضافة عمل للمهني
export const addProfessionalWorkSchema = joi.object({
  placeWorkName: joi.string().min(3).max(100).required().messages({
    'string.base': 'اسم مكان العمل يجب أن يكون نصًا',
    'string.empty': 'اسم مكان العمل مطلوب',
    'string.min': 'اسم مكان العمل يجب أن يكون على الأقل 3 أحرف',
    'string.max': 'اسم مكان العمل لا يجب أن يتجاوز 100 حرف'
  }),
  summaryAboutWork: joi.string().min(10).max(300).required().messages({
    'string.base': 'نبذة عن العمل يجب أن تكون نصًا',
    'string.empty': 'نبذة عن العمل مطلوبة',
    'string.min': 'نبذة عن العمل يجب أن تكون على الأقل 10 أحرف',
    'string.max': 'نبذة عن العمل لا يجب أن تتجاوز 300 حرف'
  }),
  description: joi.string().min(10).max(1000).required().messages({
    'string.base': 'تفاصيل العمل يجب أن تكون نصًا',
    'string.empty': 'تفاصيل العمل مطلوبة',
    'string.min': 'تفاصيل العمل يجب أن تكون على الأقل 10 أحرف',
    'string.max': 'تفاصيل العمل لا يجب أن تتجاوز 1000 حرف'
  })
});
