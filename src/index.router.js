import cors from 'cors'
import connectDb from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js';
import GovernorateRouter from './modules/governorate/governorate.router.js';
import SiteReviewRouter from './modules/SiteReview/SiteReview.router.js';
import ReviewRouter from './modules/review/review.router.js';
import ProfessionalRouter from './modules/professional/professional.router.js';
import ProfessionalProfileRouter from './modules/professional/profile/ProfessionalProfile.router.js';
import BookingRouter from './modules/Booking/Booking.router.js';
import adminRouter from '../src/modules/admin/admin.router.js'

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
    //المحافظات
    app.use('/governorate',GovernorateRouter);
    //الآراء
    app.use('/SiteReview',SiteReviewRouter);
    //الاراء بالمهنين
    app.use('/Review',ReviewRouter);
    //المهني
    app.use('/Professional',ProfessionalRouter);
     //البروفايل
    app.use('/ProfessionalProfile',ProfessionalProfileRouter);
     //ادارة الحجوزات
    app.use('/Booking',BookingRouter);
     //Admin
    app.use('/admin', adminRouter);


//في حال دخل رابط خطا 
   app.use('',(req,res)=>{
    return res.status(404).json({message:"page not found"});
   });
    
}
export default initApp; 