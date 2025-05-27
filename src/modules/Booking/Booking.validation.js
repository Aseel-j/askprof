import Joi from "joi";
import mongoose from "mongoose";

// Regex لصيغة التاريخ: dd-mm-yyyy
const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
// Regex لصيغة الوقت: hh:mm
const timeRegex = /^\d{1,2}:\d{2}$/;

const bookingSchema = Joi.object({
  // التحقق من body
  bookingDate: Joi.string()
    .pattern(dateRegex)
    .required()
    .messages({
      "string.pattern.base": "صيغة التاريخ يجب أن تكون dd-mm-yyyy",
      "any.required": "التاريخ مطلوب",
    }),

  startTime: Joi.string()
    .pattern(timeRegex)
    .required()
    .messages({
      "string.pattern.base": "صيغة الوقت يجب أن تكون hh:mm",
      "any.required": "وقت البدء مطلوب",
    }),

  endTime: Joi.string()
    .pattern(timeRegex)
    .required()
    .messages({
      "string.pattern.base": "صيغة الوقت يجب أن تكون hh:mm",
      "any.required": "وقت الانتهاء مطلوب",
    }),

  bookingDetails: Joi.string().allow("").optional(),

  // التحقق من params
  professionalId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .required()
    .messages({
      "any.invalid": "معرف المهني غير صالح",
      "any.required": "معرف المهني مطلوب",
    }),
});

export default bookingSchema;
