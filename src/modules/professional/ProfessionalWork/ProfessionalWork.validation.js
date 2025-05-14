import joi from 'joi';

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
