import Joi from "joi";

export const addGovernorateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "اسم المحافظة مطلوب",
      "string.min": "اسم المحافظة يجب أن يحتوي على حرفين على الأقل",
      "string.max": "اسم المحافظة لا يجب أن يتجاوز 50 حرفًا",
    }),
});
