import cors from 'cors'
import connectDb from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js'
import GovernorateRouter from './modules/governorate/governorate.router.js'
const initApp = async(app,express)=>{
    app.use(express.json());
    app.use(cors());
    connectDb();
    //ترحيب 
    app.get('/',(req,res)=>{
        return res.status(200).json({message:"welcome ..."});
    }); 
    //هون عشان انشاء الحساب 
    app.use('/auth',authRouter);
    app.use('/governorate',GovernorateRouter);
//في حال دخل رابط خطا 
   app.use('',(req,res)=>{
    return res.status(404).json({message:"page not found"});
   });
    
}
export default initApp; 