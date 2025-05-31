import jwt from 'jsonwebtoken';
import  {AppError} from '../utils/App.Error.js';
const auth=()=>{
    return (req,res,next)=>{
    
    const {token}= req.headers;
    const decoded= jwt.verify(token,process.env.LOGIN_SIGNAL) ;
    if(decoded.role !='admin'){
        return next (new AppError (" not authorized",400));   
    }
     req.id = decoded.id;
    next();
}
}
export default auth;