// validation/review.validation.js
import Joi from "joi";

export const addReviewSchema = {
    body: Joi.object({
      rating: Joi.number().min(1).max(5).required(),
      comment: Joi.string().min(5).max(1000).required(),
    }),
    params: Joi.object({
      professionalId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    }),
  };