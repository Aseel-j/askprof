import cors from 'cors'
import connectDb from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js';
import GovernorateRouter from './modules/governorate/governorate.router.js';
import SiteReviewRouter from './modules/SiteReview/SiteReview.router.js';
import ReviewRouter from './modules/review/review.router.js';
import ProfessionalRouter from './modules/professional/professional.router.js';
//import ProfessionalpictureAndVideoRouter from './modules/professional/ProfProfilepicture&Video/pictureAndVideo.router.js';
//import ProfessionalInformationRouter from './modules/professional/profInformation/profInformation.router.js';
//import ProfessionalWorksRouter from './modules/professional/ProfessionalWork/ProfessionalWork.router.js';
//import ProfessionalWorkingHoursRouter from './modules/professional/ProfessionalWorkingHours/ProfessionalWorkingHours.router.js';
import ProfessionalProfileRouter from './modules/professional/profile/ProfessionalProfile.router.js';

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
    //الصور والفيديوهات للمهنيين
    /*app.use('/ProfessionalpictureAndVideo',ProfessionalpictureAndVideoRouter);
    //معلومات المهني
    app.use('/ProfessionalInformation',ProfessionalInformationRouter);
     //اعمال المهني
    app.use('/ProfessionalWorks',ProfessionalWorksRouter);
     //ساعات عمل المهني
    app.use('/ProfessionalWorkingHours',ProfessionalWorkingHoursRouter);*/
     //البروفايل
    app.use('/ProfessionalProfile',ProfessionalProfileRouter);


//في حال دخل رابط خطا 
   app.use('',(req,res)=>{
    return res.status(404).json({message:"page not found"});
   });
    
}
export default initApp; 