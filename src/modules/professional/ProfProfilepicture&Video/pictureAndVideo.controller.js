import professionalModel from '../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import cloudinary from '../../../utils/cloudinary.js';

//تحميل الصورة الشخصية
export const uploadProfilePicture = async (req, res) => {
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

  if (!req.file || !req.file.mimetype.startsWith("image/")) {
    return res.status(400).json({ message: "يرجى رفع صورة فقط" });
  }

  // حذف الصورة القديمة إن وجدت
  if (professional.profilePicture) {
    const publicId = professional.profilePicture.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
  }

  // رفع الصورة الجديدة
  const { secure_url } = await cloudinary.uploader.upload(req.file.path);

  // تحديث قاعدة البيانات
  professional.profilePicture = secure_url;
  await professional.save();

  return res.status(200).json({
    message: "تم تحديث صورة البروفايل بنجاح",
    imageUrl: secure_url,
  });
};
//تحميل الفيديو
export const uploadVideo = async (req, res) => {
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

  if (!req.file || !req.file.mimetype.startsWith("video/")) {
    return res.status(400).json({ message: "يرجى رفع ملف فيديو فقط" });
  }

  // حذف الفيديو السابق إن وجد
  if (professional.video) {
    const publicId = professional.video.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  }

  // رفع الفيديو الجديد
  const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "video",
  });

  // تحديث الفيديو في قاعدة البيانات
  professional.video = secure_url;
  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الفيديو بنجاح",
    videoUrl: secure_url,
  });
};
//ارجاع الصورة
export const getProfilePicture = async (req, res) => {
  const { id } = req.params;  // الحصول على ID المهني من الـ params

  // التحقق من وجود المهني في قاعدة البيانات
  const professional = await professionalModel.findById(id);

  if (!professional) {
        return res.status(404).json({ message: "المهني غير موجود" });

   // return next(new AppError("User not found", 404));
  }

  return res.status(200).json({ message: "تم ارجاع الصورة بنجاح",imageUrl: professional.profilePicture || null});
};
//ارجاع الفيديو 
export const getVideo = async (req, res) => {
  const { id } = req.params;  // الحصول على ID المهني من الـ params

  // التحقق من وجود المهني في قاعدة البيانات
  const professional = await professionalModel.findById(id);

  if (!professional) {
  return res.status(404).json({ message: "المهني غير موجود" });

   // return next(new AppError("User not found", 404));
  }

  return res.status(200).json({message: "Video fetched successfully",videoUrl: professional.video || null});
};