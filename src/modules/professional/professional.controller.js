import professionalModel from '../../../DB/models/professional.model.js';
import GovernorateModel from '../../../DB/models/governorate.model.js';
import ReviewModel from '../../../DB/models/review.model.js'


//عرض المهنيين
export const getProfessionals = async (req, res) => {
  const { governorateName, professionField } = req.query; // تم تغيير field إلى professionField

  // التحقق من وجود المعلمات المطلوبة
  if (!governorateName || !professionField) { // تغيير field إلى professionField
    return res.status(400).json({ message: "يرجى إرسال اسم المحافظة والمجال المهني" });
  }

  // البحث عن ID للمحافظة
  const governorate = await GovernorateModel.findOne({ name: governorateName });
  if (!governorate) {
    return res.status(404).json({ message: "المحافظة غير موجودة" });
  }

  // جلب المهنيين بناءً على المحافظة والمجال
  const professionals = await professionalModel.find({
    governorate: governorate._id,
    professionField: professionField, // تم تغيير field إلى professionField
    isApproved: true,
    confirmEmail: true
  }).select("_id username professionField  governorate");

  // حساب التوتال للمهنيين الذين تطابقوا مع الشروط
  const totalProfessionals = professionals.length;

  // تصنيف المهنيين وحساب التقييمات
  const result = await Promise.all(professionals.map(async (pro) => {
    // جلب التقييمات الخاصة بكل مهني
    const reviews = await ReviewModel.find({ professional: pro._id });

    // حساب متوسط التقييمات
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length ? (totalRatings / reviews.length).toFixed(1) : "لا يوجد تقييمات";

    return {
      _id: pro._id,
      username: pro.username, // عرض اسم المستخدم بدلاً من الاسم
      professionField: pro.professionField, // عرض مجال المهني
      governorate: pro.governorate.name,
      rating: averageRating // عرض فقط معدل التقييمات
    };
  }));

  res.status(200).json({
    message: "تم جلب المهنيين بنجاح",
    totalProfessionals: totalProfessionals, // إضافة التوتال
    professionals: result
  });
};
//تطبيق الفلتر 
export const getProfessionalsByRating = async (req, res) => {
  const { governorateName, professionField, targetRating } = req.query;

  if (!governorateName || !professionField) {
    return res.status(400).json({ message: "يرجى إرسال اسم المحافظة والمجال" });
  }

  const governorate = await GovernorateModel.findOne({ name: governorateName });
  if (!governorate) {
    return res.status(404).json({ message: "المحافظة غير موجودة" });
  }

  const professionals = await professionalModel.find({
    governorate: governorate._id,
    professionField,
    isApproved: true,
    confirmEmail: true
  })
    .select("_id username professionField  governorate")
    .populate("governorate", "name");

  const result = await Promise.all(professionals.map(async (pro) => {
    const reviews = await ReviewModel.find({ professional: pro._id });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = reviews.length ? (total / reviews.length) : null;

    return {
      _id: pro._id,
      username: pro.username,
      professionField: pro.professionField,
      governorate: pro.governorate.name,
      rating: average,
    };
  }));

  let filteredResult = result;
  if (targetRating) {
    const target = parseFloat(targetRating);
    const range = 0.5;
    filteredResult = result.filter(p =>
      p.rating !== null &&
      p.rating >= target - range &&
      p.rating <= target + range
    );
  }

  res.status(200).json({
    message: "تم جلب المهنيين بنجاح",
    total: filteredResult.length,
    professionals: filteredResult
  });
};
//البحث
export const searchProfessionalsByName = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "يرجى إدخال الاسم للبحث" });
  }

  const professionals = await professionalModel.find({
    username: { $regex: name, $options: 'i' },
    isApproved: true,
    confirmEmail: true
  })
    .select('_id username professionField  governorate')
    .populate('governorate', 'name');

  const result = await Promise.all(professionals.map(async (pro) => {
    const reviews = await ReviewModel.find({ professional: pro._id });
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = reviews.length ? (total / reviews.length) : null;

    return {
      _id: pro._id,
      username: pro.username,
      professionField: pro.professionField,
      governorate: pro.governorate?.name || null,
      averageRating: average ? average.toFixed(2) : null
    };
  }));

  res.status(200).json({
    message: "تم العثور على المهنيين بنجاح",
    total: result.length,
    professionals: result
  });
};
