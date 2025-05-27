import jwt from 'jsonwebtoken';
import  {AppError} from '../utils/AppError.js';
const auth=()=>{
    return (req,res,next)=>{
    
    const {token}= req.headers;
    const decoded= jwt.verify(token,'aseel') ;
    if(decoded.role !='admin'){
        return next (new AppError (" not authorized",400));   
    }
     req.id = decoded.id;
    next();
}
}

export default auth;