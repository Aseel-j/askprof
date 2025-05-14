import professionalModel from '../../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import professionalWorkModel from '../../../../../DB/models/professional.model.js';

//اضافة عمل
export const addProfessionalWork = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const { placeWorkName, summaryAboutWork, description } = req.body;

  if (!summaryAboutWork || !description) {
    return res.status(400).json({ message: "الرجاء إدخال نبذة وتفاصيل عن العمل" });
  }

  const newWork = await professionalWorkModel.create({
    professional: professional._id,
    placeWorkName,
    summaryAboutWork,
    description
  });

  return res.status(201).json({ message: "تمت إضافة العمل بنجاح", work: newWork });
};
//عرض الاعمال 
export const getProfessionalWorks = async (req, res) => {
     const { id } = req.params;

    // تحقق من وجود المهني
    const professional = await professionalModel.findById(id);
    if (!professional) {
      return res.status(404).json({ message: "المهني غير موجود" });

      //return next(new AppError("المهني غير موجود", 404));
    }

    // جلب الأعمال المرتبطة بهذا المهني
    const works = await professionalWorkModel.find({ professional: id }).sort({ date: -1 });
    const total = works.length;

    return res.status(200).json({message: "تم جلب الأعمال بنجاح",total,works});
 
};
//حذف العمل 
export const deleteWork = async (req, res, next) => {
    const { token } = req.headers;
   const workId = req.params.id; // الحصول على ID العمل من المعاملات (params)

    // فك التوكن للحصول على ID المهني
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
    const professional = await professionalModel.findById(decoded.id);

    if (!professional) {
     return res.status(404).json({ message: "المهني غير موجود" });

      //return next(new AppError("المهني غير موجود", 404));
    }

    // العثور على العمل بناءً على ID المهني و ID العمل
    const work = await professionalWorkModel.findOne({ _id: workId, professional: decoded.id });
    if (!work) {
      return res.status(404).json({ message: "العمل غير موجود أو ليس لديك صلاحية لحذفه" });

     // return next(new AppError("العمل غير موجود أو ليس لديك صلاحية لحذفه", 404));
    }

    // حذف العمل
    await professionalWorkModel.deleteOne({ _id: workId });

    return res.status(200).json({ message: "تم حذف العمل بنجاح" });
 
};