import Joi from "joi";

export const searchByNameSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.base": "الاسم يجب أن يكون نصًا",
      "string.empty": "الاسم مطلوب",
      "string.min": "الاسم يجب أن يحتوي على حرف واحد على الأقل",
      "string.max": "الاسم لا يجب أن يتجاوز 50 حرفًا",
      "any.required": "الاسم مطلوب"
    })
});
