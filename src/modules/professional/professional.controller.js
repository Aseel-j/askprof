import professionalModel from '../../../DB/models/professional.model.js';
import GovernorateModel from '../../../DB/models/governorate.model.js';
import ReviewModel from '../../../DB/models/review.model.js'
import { getProfessionalsSchema ,getProfessionalsByRatingSchema,searchProfessionalsByNameSchema} from "./professional.validation.js";

//عرض المهنيين
/*export const getProfessionals = async (req, res) => {
  
    const { error } = getProfessionalsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
    }

    const { governorateName, professionField } = req.query;
    const governorate = await GovernorateModel.findOne({ name: governorateName });
    if (!governorate) return res.status(404).json({ message: "المحافظة غير موجودة" });

    const professionals = await professionalModel.find({
      governorate: governorate._id,
      professionField,
      isApproved: true,
      confirmEmail: true
    }).select("_id username professionField governorate").lean();

    const professionalIds = professionals.map(p => p._id);
    const reviews = await ReviewModel.aggregate([
      { $match: { professional: { $in: professionalIds } } },
      {
        $group: {
          _id: "$professional",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingMap = new Map(reviews.map(r => [r._id.toString(), r.averageRating.toFixed(1)]));

    const result = professionals.map(p => ({
      _id: p._id,
      username: p.username,
      professionField: p.professionField,
      governorate: governorate.name,
      rating: ratingMap.get(p._id.toString()) || "لا يوجد تقييمات"
    }));

    res.status(200).json({
      message: "تم جلب المهنيين بنجاح",
      totalProfessionals: result.length,
      professionals: result
    });
  
};*/
export const getProfessionals = async (req, res) => {
  const { error } = getProfessionalsSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
  }

  const { governorateName, professionField } = req.query;
  const governorate = await GovernorateModel.findOne({ name: governorateName });
  if (!governorate) return res.status(404).json({ message: "المحافظة غير موجودة" });

  const professionals = await professionalModel.find({
    governorate: governorate._id,
    professionField,
    isApproved: true,
    confirmEmail: true
  }).select("_id username professionField governorate").lean();

  const professionalIds = professionals.map(p => p._id);
  const reviews = await ReviewModel.aggregate([
    { $match: { professional: { $in: professionalIds } } },
    {
      $group: {
        _id: "$professional",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const ratingMap = new Map(
    reviews.map(r => [r._id.toString(), Number(r.averageRating.toFixed(1))])
  );

  const result = professionals.map(p => ({
    _id: p._id,
    username: p.username,
    professionField: p.professionField,
    governorate: governorate.name,
    rating: ratingMap.get(p._id.toString()) ?? "لا يوجد تقييمات"
  }));

  res.status(200).json({
    message: "تم جلب المهنيين بنجاح",
    totalProfessionals: result.length,
    professionals: result
  });
};
//تطبيق الفلتر 
/*export const getProfessionalsByRating = async (req, res) => {
  
    const { error } = getProfessionalsByRatingSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
    }

    const { governorateName, professionField, targetRating } = req.query;
    const governorate = await GovernorateModel.findOne({ name: governorateName });
    if (!governorate) return res.status(404).json({ message: "المحافظة غير موجودة" });

    const professionals = await professionalModel.find({
      governorate: governorate._id,
      professionField,
      isApproved: true,
      confirmEmail: true
    }).select("_id username professionField governorate").lean();

    const professionalIds = professionals.map(p => p._id);
    const reviews = await ReviewModel.aggregate([
      { $match: { professional: { $in: professionalIds } } },
      {
        $group: {
          _id: "$professional",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingMap = new Map(reviews.map(r => [r._id.toString(), r.averageRating]));

    let result = professionals.map(p => {
      const avg = ratingMap.get(p._id.toString());
      return {
        _id: p._id,
        username: p.username,
        professionField: p.professionField,
        governorate: governorate.name,
        rating: avg !== undefined ? avg : null
      };
    });

    if (targetRating) {
      const target = parseFloat(targetRating);
      const range = 0.5;
      result = result.filter(p => p.rating !== null && p.rating >= target - range && p.rating <= target + range);
    }

    res.status(200).json({
      message: "تم جلب المهنيين بنجاح",
      total: result.length,
      professionals: result
    });
  
};*/
export const getProfessionalsByRating = async (req, res) => {
  const { error } = getProfessionalsByRatingSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
  }

  const { governorateName, professionField, targetRating } = req.query;
  const governorate = await GovernorateModel.findOne({ name: governorateName });
  if (!governorate) return res.status(404).json({ message: "المحافظة غير موجودة" });

  const professionals = await professionalModel.find({
    governorate: governorate._id,
    professionField,
    isApproved: true,
    confirmEmail: true
  }).select("_id username professionField governorate").lean();

  const professionalIds = professionals.map(p => p._id);
  const reviews = await ReviewModel.aggregate([
    { $match: { professional: { $in: professionalIds } } },
    {
      $group: {
        _id: "$professional",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const ratingMap = new Map(
    reviews.map(r => [r._id.toString(), Number(r.averageRating.toFixed(1))])
  );

  let result = professionals.map(p => {
    const avg = ratingMap.get(p._id.toString());
    return {
      _id: p._id,
      username: p.username,
      professionField: p.professionField,
      governorate: governorate.name,
      rating: avg ?? null
    };
  });

  if (targetRating) {
    const target = parseFloat(targetRating);
    const range = 0.5;
    result = result.filter(p => p.rating !== null && p.rating >= target - range && p.rating <= target + range);
  }

  res.status(200).json({
    message: "تم جلب المهنيين بنجاح",
    total: result.length,
    professionals: result
  });
};
//البحث
export const searchProfessionalsByName = async (req, res) => {
  const { error } = searchProfessionalsByNameSchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
  }

  const { name, governorateName, targetRating } = req.query;

  let governorateFilter = {};
  let governorateNameResult = null;

  if (governorateName) {
    const governorate = await GovernorateModel.findOne({ name: governorateName });
    if (!governorate) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }
    governorateFilter = { governorate: governorate._id };
    governorateNameResult = governorate.name;
  }

  const professionals = await professionalModel.find({
    username: { $regex: name, $options: 'i' },
    isApproved: true,
    confirmEmail: true,
    ...governorateFilter
  }).populate('governorate', 'name')
    .select('_id username professionField governorate')
    .lean();

  const professionalIds = professionals.map(p => p._id);
  const reviews = await ReviewModel.aggregate([
    { $match: { professional: { $in: professionalIds } } },
    {
      $group: {
        _id: "$professional",
        averageRating: { $avg: "$rating" }
      }
    }
  ]);

  const ratingMap = new Map(
    reviews.map(r => [r._id.toString(), Number((Math.round(r.averageRating * 10) / 10).toFixed(1))])
  );

  let result = professionals.map(p => {
    const avg = ratingMap.get(p._id.toString());
    return {
      _id: p._id,
      username: p.username,
      professionField: p.professionField,
      governorate: p.governorate?.name || governorateNameResult,
      rating: avg ?? null
    };
  });

  if (targetRating) {
    const target = parseFloat(targetRating);
    const range = 0.5;
    result = result.filter(p => p.rating !== null && p.rating >= target - range && p.rating <= target + range);
  }

  res.status(200).json({
    message: "تم العثور على المهنيين بنجاح",
    total: result.length,
    professionals: result
  });
};

/*export const searchProfessionalsByName = async (req, res) => {
  
    const { error } = searchProfessionalsByNameSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: "خطأ في البيانات", errors: error.details.map(e => e.message) });
    }
  const governorate = await GovernorateModel.findOne({ name: governorateName });
  if (!governorate) return res.status(404).json({ message: "المحافظة غير موجودة" });

    const { name } = req.query;
    const professionals = await professionalModel.find({
      username: { $regex: name, $options: 'i' },
      isApproved: true,
      confirmEmail: true
    }).select('_id username professionField governorate').lean();

    const professionalIds = professionals.map(p => p._id);
    const reviews = await ReviewModel.aggregate([
      { $match: { professional: { $in: professionalIds } } },
      {
        $group: {
          _id: "$professional",
          averageRating: { $avg: "$rating" }
        }
      }
    ]);

    const ratingMap = new Map(reviews.map(r => [r._id.toString(), r.averageRating.toFixed(2)]));

    const result = professionals.map(p => ({
      _id: p._id,
      username: p.username,
      professionField: p.professionField,
      governorate: governorate.name || null,
      //averageRating: ratingMap.get(p._id.toString()) || null
      rating:ratingMap.get(p._id.toString()) || null,
    }));

    res.status(200).json({
      message: "تم العثور على المهنيين بنجاح",
      total: result.length,
      professionals: result
    });
  
};*/
/*
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
};*/