import { AppError } from "../utils/App.Error.js";

const validation = (schemas) => {
  return (req, res, next) => {
    const errors = [];
    // Validate body
    if (schemas.body) {
      const result = schemas.body.validate(req.body, { abortEarly: false });
      if (result.error) {
        errors.push(...result.error.details.map(err => err.message));
      }
    }
    // Validate params
    if (schemas.params) {
      const result = schemas.params.validate(req.params, { abortEarly: false });
      if (result.error) {
        errors.push(...result.error.details.map(err => err.message));
      }
    }
    // Validate query (if needed)
    if (schemas.query) {
      const result = schemas.query.validate(req.query, { abortEarly: false });
      if (result.error) {
        errors.push(...result.error.details.map(err => err.message));
      }
    }
    if (errors.length > 0) {
      return next(new AppError(errors.join(" | "), 400));
    }
    next();
  };
};
export default validation;
