import { AppError } from "../utils/App.Error.js";


const validation =(schema)=>{
    return(req,res,next)=>{
        const inputData={...req.body,...req.params};
        const validationResult = schema.validate(inputData,{abortEarly: false}); 
                    if (validationResult?.error) { 
                    return next(new AppError(validationResult.error,400)); 
                    }
                   
                        next();
                }
}
export default validation;