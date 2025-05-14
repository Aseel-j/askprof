import jwt from "jsonwebtoken";
import professionalModel from '../../../DB/models/professional.model.js';
import userModel from '../../../DB/models/user.model.js';
import ReviewModel from '../../../DB/models/review.model.js'; 
import { AppError } from '../../utils/App.Error.js';

export const addReview = async (req, res) => {
  const { comment, rating } = req.body;
  const {professionalId}=req.params;

    // التحقق من وجود التوكن
    const {token} = req.headers;
    // فك التوكن
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

    // التحقق من هوية المستخدم
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "المستخدم غير موجود" });

     // return next(new AppError("المستخدم غير موجود", 404));
    }

    if (user.usertype !== "مستخدم") {
       return res.status(403).json({ message: "فقط المستخدم يستطيع تقييم الموقع" });

     // return next(new AppError("فقط المستخدم يستطيع تقييم الموقع", 403));
    }

  // تحقق من وجود المهني
  const professional = await professionalModel.findById(professionalId);
  if (!professional) {
     return res.status(404).json({ message: "المهني غير موجود" });

    //return next(new AppError("المهني غير موجود", 404));
  }

  // تحقق من عدم تكرار التقييم
  const existingReview = await ReviewModel.findOne({
    user: user._id,
    professional: professionalId,
  });

  if (existingReview) {
    return res.status(400).json({ message: "لقد قمت بتقييم هذا المهني مسبقًا" });

   // return next(new AppError("لقد قمت بتقييم هذا المهني مسبقًا", 400));
  }

  // إنشاء التقييم
  const newReview = await ReviewModel.create({
    user: user._id,
    professional: professionalId,
    rating: Number(rating), // تأكد أن التقييم رقم
    comment,
  });

  return res.status(201).json({
    message: "تمت إضافة التقييم بنجاح",
    review: newReview,
  });
};
//ارجاع راي حسب المهني 
export const getProfessionalReviews = async (req, res) => {
      const { professionalId } = req.params;
  
      const reviews = await ReviewModel.find({ professional: professionalId })
        .populate("user", "username") // جلب اسم المستخدم فقط
        .sort({ date: -1 }); // ترتيب تنازلي حسب التاريخ
  
      return res.status(200).json({ reviews });
  
  };
  