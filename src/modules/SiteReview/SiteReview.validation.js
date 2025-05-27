import Joi from "joi";

export const addSiteReviewSchema = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      "number.base": "يجب أن يكون التقييم رقمًا",
      "number.min": "أقل تقييم هو 1",
      "number.max": "أعلى تقييم هو 5",
      "any.required": "التقييم مطلوب",
    }),

  comment: Joi.string()
    .min(5)
    .max(1000)
    .required()
    .messages({
      "string.base": "يجب أن يكون التعليق نصًا",
      "string.min": "التعليق قصير جدًا",
      "string.max": "التعليق طويل جدًا",
      "any.required": "التعليق مطلوب",
    }),
});
