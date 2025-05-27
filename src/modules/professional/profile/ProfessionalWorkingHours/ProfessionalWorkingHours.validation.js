import Joi from "joi";

export const addWorkingHoursSchema = Joi.object({
  workingHours: Joi.array().items(
    Joi.object({
      day: Joi.string().required().messages({
        'string.base': 'اليوم يجب أن يكون نصًا',
        'string.empty': 'اليوم مطلوب'
      }),
      date: Joi.string().required().messages({
        'string.base': 'التاريخ يجب أن يكون نصًا',
        'string.empty': 'التاريخ مطلوب'
      }),
      startTime: Joi.string().required().messages({
        'string.base': 'وقت البدء يجب أن يكون نصًا',
        'string.empty': 'وقت البدء مطلوب'
      }),
      endTime: Joi.string().required().messages({
        'string.base': 'وقت الانتهاء يجب أن يكون نصًا',
        'string.empty': 'وقت الانتهاء مطلوب'
      }),
      status: Joi.string().valid("متاح", "محجوز").default("متاح").optional().messages({
        'string.base': 'حالة الموعد يجب أن تكون نصًا',
        'any.only': 'حالة الموعد يجب أن تكون إما "متاح" أو "محجوز"'
      })
    }).custom((value, helpers) => {
      const start = parseInt(value.startTime.replace(":", ""));
      const end = parseInt(value.endTime.replace(":", ""));
      if (start >= end) {
        return helpers.error("any.invalid");
      }
      return value;
    }).messages({
      'any.invalid': 'وقت البدء يجب أن يكون قبل وقت الانتهاء'
    })
  ).min(1).required().messages({
    'array.base': 'المواعيد يجب أن تكون في مصفوفة',
    'array.min': 'يرجى إدخال موعد واحد على الأقل',
    'any.required': 'حقل المواعيد مطلوب'
  })
});
