import Joi from "joi";
//  عرض المهنيين حسب المجال 
export const getProfessionalsSchema = Joi.object({
  governorateName: Joi.string().min(2).required().messages({
    "any.required": "اسم المحافظة مطلوب",
    "string.empty": "اسم المحافظة لا يمكن أن يكون فارغًا"
  }),
  professionField: Joi.string().min(2).required().messages({
    "any.required": "المجال المهني مطلوب",
    "string.empty": "المجال المهني لا يمكن أن يكون فارغًا"
  })
});
//ضبط الفلتر 
export const getProfessionalsByRatingSchema = Joi.object({
  governorateName: Joi.string().min(2).required().messages({
    "any.required": "اسم المحافظة مطلوب"
  }),
  professionField: Joi.string().min(2).required().messages({
    "any.required": "المجال المهني مطلوب"
  }),
  targetRating: Joi.number().min(0).max(5).optional().messages({
    "number.base": "قيمة التقييم يجب أن تكون رقمًا",
    "number.min": "أقل تقييم هو 0",
    "number.max": "أعلى تقييم هو 5"
  })
});
//البحث 
export const searchProfessionalsByNameSchema = Joi.object({
  name: Joi.string().min(1).required().messages({
    "any.required": "الاسم مطلوب للبحث",
    "string.empty": "الاسم لا يمكن أن يكون فارغًا"
  })
});
