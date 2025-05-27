import professionalModel from '../../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import professionalWorkModel from '../../../../../DB/models/professionalWork.model.js';
import cloudinary from '../../../../utils/cloudinary.js';

//اضافة عمل
export const addProfessionalWork = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const { placeWorkName, summaryAboutWork, description } = req.body;

  if (!summaryAboutWork || !description) {
    return res.status(400).json({ message: "يرجى إدخال نبذة وتفاصيل عن العمل" });
  }

  // رفع الصور إلى Cloudinary
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(file =>
      cloudinary.uploader.upload(file.path)
    );
    const uploadResults = await Promise.all(uploadPromises);
    imageUrls = uploadResults.map(result => result.secure_url);
  }

  const newWork = await professionalWorkModel.create({
    professional: professional._id,
    placeWorkName,
    summaryAboutWork,
    description,
    images: imageUrls
  });

  return res.status(201).json({
    message: "تمت إضافة العمل بنجاح",
    work: newWork
  });
};
//عرض الاعمال 
export const getProfessionalWorks = async (req, res) => {
  const { id } = req.params;

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const works = await professionalWorkModel
    .find({ professional: id })
    .sort({ date: -1 })
    .lean(); // تحسين الأداء

  const formattedWorks = works.map(work => ({
    id: work._id,
    placeWorkName: work.placeWorkName,
    summaryAboutWork: work.summaryAboutWork,
    description: work.description,
    images: work.images || [], // ✅ عرض الصور
    date: work.date
  }));

  return res.status(200).json({
    message: "تم جلب الأعمال بنجاح",
    total: formattedWorks.length,
    works: formattedWorks
  });
};
//تعديل على العمل 
export const editProfessionalWork = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params; // هذا id العمل

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  // فك التوكن
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  // الحصول على العمل
  const work = await professionalWorkModel.findById(id);
  if (!work) {
    return res.status(404).json({ message: "العمل غير موجود" });
  }

  // التأكد أن صاحب العمل هو نفسه المهني
  if (work.professional.toString() !== decoded.id) {
    return res.status(403).json({ message: "غير مصرح لك بتعديل هذا العمل" });
  }

  // تجهيز التعديلات
  const updates = {};
  const body = req.body || {};

  if (body.placeWorkName) updates.placeWorkName = body.placeWorkName;
  if (body.summaryAboutWork) updates.summaryAboutWork = body.summaryAboutWork;
  if (body.description) updates.description = body.description;

  // رفع الصور الجديدة إن وُجدت
  if (req.files && req.files.length > 0) {
    try {
      const uploadResults = await Promise.all(
        req.files.map((file) => cloudinary.uploader.upload(file.path))
      );
      updates.images = uploadResults.map((result) => result.secure_url);
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ أثناء رفع الصور", error });
    }
  }

  // التحديث
  const updatedWork = await professionalWorkModel.findByIdAndUpdate(id, updates, {
    new: true,
  });

  return res.status(200).json({
    message: "تم تعديل العمل بنجاح",
    work: updatedWork,
  });
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
    }

    // العثور على العمل بناءً على ID المهني و ID العمل
    const work = await professionalWorkModel.findOne({ _id: workId, professional: decoded.id });
    if (!work) {
      return res.status(404).json({ message: "العمل غير موجود أو ليس لديك صلاحية لحذفه" });
    }

    // حذف العمل
    await professionalWorkModel.deleteOne({ _id: workId });

    return res.status(200).json({ message: "تم حذف العمل بنجاح" });
 
};