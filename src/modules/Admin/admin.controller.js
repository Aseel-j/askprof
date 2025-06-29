import bcrypt from "bcrypt";
import AdminModel from "../../../DB/models/admin.model.js";
import jwt from 'jsonwebtoken';
import { customAlphabet } from 'nanoid';
import { sendEmail } from "../../utils/SendEmail.js";
import SiteReviewModel from '../../../DB/models/SiteReview.model.js'; // غيّر المسار حسب مكان الموديل
//تسجيل الدخول 
export const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  // البحث عن الأدمن بالبريد الإلكتروني
  const admin = await AdminModel.findOne({ email });
  if (!admin) {
    return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
  }

  // التحقق من كلمة المرور
  const isMatch = bcrypt.compareSync(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
  }

  // توليد التوكن
  const token = jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      role: "admin"
    },
    process.env.LOGIN_SIGNAL
  );

  return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
};
//ارسال رمز تحقق
export const SendCode = async (req, res, next) => {
  const { email } = req.body;
   const code = customAlphabet('1234567890abcdefABCDEF', 6)();
const expireTime = new Date(Date.now() + 5 * 60 * 1000); // بعد 5 دقائق

  // البحث عن المستخدم أو المهني أو الأدمن
  let user = await AdminModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "البريد الإلكتروني غير مسجل" });
  }
  // حفظ الكود وصلاحية الكود
  user.sendCode = code;
  user.codeExpire = expireTime;
  await user.save();

  // إرسال الكود بالبريد الإلكتروني
  const html = `<h2>رمز التحقق هو: ${code}</h2><p>صالح لمدة 10 دقائق فقط.</p>`;
  await sendEmail(email, 'تغيير كلمة المرور', html);

  return res.status(200).json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
};
//تغيير كلمة المرور
export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await AdminModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "البريد الإلكتروني غير صحيح" });
  }

  if (!user.sendCode || user.sendCode !== code) {
    return res.status(400).json({ message: "رمز التحقق غير صحيح" });
  }

  if (!user.codeExpire || user.codeExpire < new Date()) {
    user.sendCode = null;
    user.codeExpire = null;
    await user.save();
    return res.status(400).json({ message: "انتهت صلاحية رمز التحقق" });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  user.password = hashedPassword;
  user.sendCode = null;
  user.codeExpire = null;
  await user.save();

  return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
};
//معدل التقييم للموقع
export const getAvgReviewStats = async (req, res) => {
  const result = await SiteReviewModel.aggregate([
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  // لو ما في تقييمات، رجّع صفر
  const stats = result[0] || { averageRating: 0, totalReviews: 0 };

  return res.status(200).json({
    message: "نجاح",
    averageRating: stats.averageRating.toFixed(1),  // رقم عشري واحد
    totalReviews: stats.totalReviews
  });
};

