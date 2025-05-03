// controllers/reviewController.js
import jwt from "jsonwebtoken";
import SiteReviewModel from '../../../DB/models/SiteReview.model.js'; 
import userModel from '../../../DB/models/user.model.js';
import { AppError } from '../../utils/App.Error.js';

//اضافة رأي 
export const addSiteReview = async (req, res, next) => {
    const { comment, rating } = req.body;

    // التحقق من وجود التوكن
    const {token} = req.headers;
    // فك التوكن
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

    // التحقق من هوية المستخدم
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(new AppError("المستخدم غير موجود", 404));
    }

    if (user.usertype !== "مستخدم") {
      return next(new AppError("فقط المستخدم يستطيع تقييم الموقع", 403));
    }

    // إنشاء تقييم الموقع
    const newReview = await SiteReviewModel.create({
      user: user._id,
      rating,
      comment,
    });

    return res.status(201).json({message: "تمت إضافة تقييمك للموقع بنجاح",review:newReview});
  
};

//ارجاع الاراء 
/*export const getSiteReviews = async (req, res, next) => {
    // استخراج skip و limit من الاستعلام (query)
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 10;

    // جلب التقييمات مع المستخدم المرتبط بها (اختياريًا populate)
    const reviews = await SiteReviewModel.find()
      .populate("user", "username") // إذا كنت تريد عرض اسم المستخدم
      .sort({ createdAt: -1 }) // الترتيب من الأحدث
      .skip(skip)
      .limit(limit);

    // حساب العدد الكلي للتقييمات
    const totalReviews = await SiteReviewModel.countDocuments();

    res.status(200).json({
      total: totalReviews,
      count: reviews.length,
      reviews,
    });
  
};*/
export const getSiteReviews = async (req, res, next) => {
    // إحضار كل التقييمات مع اسم المستخدم
    const allReviews = await SiteReviewModel.find()
      .populate("user", "username");

    // اختيار 15 تقييم عشوائي
    const shuffled = allReviews.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 15);

    res.status(200).json({
      total: allReviews.length,
      count: selected.length,
      reviews: selected,
    });
  
};