import ReviewModel from '../../../DB/models/review.model.js'; 
import { AppError } from '../../utils/App.Error.js';

export const addReview = async (req, res, next) => {
    const { comment } = req.body;
    const token = req.headers; 
    const decoded= jwt.verify(token,process.env.LOGIN_SIGNAL) ;
    if(decoded.role !='admin'){
      return next(new AppError (" not authorized",400));  
  }
    // تحقق من أن المستخدم لم يقم بتقييم نفس المهني سابقًا (اختياري)
    const existingReview = await ReviewModel.findOne({ user: userId, professional: professionalId });
    if (existingReview) {
      return next(new AppError("لقد قمت بتقييم هذا المهني مسبقًا", 400));
    }

    const newReview = await ReviewModel.create({
      user: userId,
      professional: professionalId,
      rating,
      comment,
    });

    return res.status(201).json({ message: "تمت إضافة التقييم بنجاح", review: newReview });
};
//ارجاع راي حسب المهني 
export const getProfessionalReviews = async (req, res, next) => {
    try {
      const { professionalId } = req.params;
  
      const reviews = await ReviewModel.find({ professional: professionalId })
        .populate("user", "username") // جلب اسم المستخدم فقط
        .sort({ date: -1 }); // ترتيب تنازلي حسب التاريخ
  
      return res.status(200).json({ reviews });
    } catch (error) {
      next(error);
    }
  };
  