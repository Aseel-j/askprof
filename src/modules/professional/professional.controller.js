import professionalModel from '../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import { AppError } from '../../utils/App.Error.js';
import cloudinary from '../../utils/cloudinary.js';
import GovernorateModel from '../../../DB/models/governorate.model.js';
import professionalWorkModel from '../../../DB/models/professionalWork.model.js';
import workingHoursModel from '../../../DB/models/workingHours.model.js';
import moment from "moment";


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
export const getProfilePicture = async (req, res, next) => {
  const { id } = req.params;  // الحصول على ID المهني من الـ params

  // التحقق من وجود المهني في قاعدة البيانات
  const professional = await professionalModel.findById(id);

  if (!professional) {
    return next(new AppError("User not found", 404));
  }

  return res.status(200).json({
    message: "Profile picture fetched successfully",
    imageUrl: professional.profilePicture || null
  });
};
//ارجاع الفيديو 
export const getVideo = async (req, res, next) => {
  const { id } = req.params;  // الحصول على ID المهني من الـ params

  // التحقق من وجود المهني في قاعدة البيانات
  const professional = await professionalModel.findById(id);

  if (!professional) {
    return next(new AppError("User not found", 404));
  }

  return res.status(200).json({
    message: "Video fetched successfully",
    videoUrl: professional.video || null
  });
};
//تعديل بيانات البروفايل
export const updateProfessionalProfile = async (req, res) => {
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

  const { username, bio, governorate, city, anotheremail, phoneNumber } = req.body;

  if (governorate) {
    const governoratename = await GovernorateModel.findOne({ name: governorate });
    if (!governoratename) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }
    professional.governorate = governoratename._id;
  }

  if (username) professional.username = username;
  if (anotheremail) professional.anotheremail = anotheremail;
  if (bio) professional.bio = bio;
  if (phoneNumber) professional.phone = phoneNumber;
  if (city) professional.city = city;

  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الملف الشخصي بنجاح",
    professional,
  });
};
//عرض بيانات الملف الشخص
 export const getProfessionalProfile = async (req, res, next) => {
  const { id } = req.params;  // الحصول على ID المهني من الـ params

  // التحقق من وجود المهني في قاعدة البيانات
  const professional = await professionalModel
    .findById(id)
    .populate("governorate", "name"); // إحضار اسم المحافظة فقط

  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  // الحقول التي نريد عرضها فقط
  const allowedFields = [
    "username",
    "city",
    "governorate",
    "bio",
    "phoneNumber",
    "anotheremail"
  ];

  const profileObj = professional.toObject(); // نحوله لكائن عادي
  const filteredProfile = {};

  for (const field of allowedFields) {
    const value = profileObj[field];
    if (value !== null && value !== undefined) {
      filteredProfile[field] =
        field === "governorate" && typeof value === "object"
          ? value.name
          : value;
    }
  }

  return res.status(200).json(filteredProfile);
};
// اضافة شرح عن المهني
 export const updateProfessionalDescription = async (req, res) => {
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

  const { description } = req.body;
  if (!description || description.trim() === "") {
    return res.status(400).json({ message: "الوصف مطلوب" });
  }

  professional.description = description;
  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الوصف بنجاح",
    description: professional.description,
  });
};
//عرض نبذة عن المهني
 export const getProfessionalDescription = async (req, res, next) => {
  const { id } = req.params;

  const professional = await professionalModel.findById(id);

  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  return res.status(200).json({
    description: professional.description || null,
  });
};
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
export const getProfessionalWorks = async (req, res, next) => {
     const { id } = req.params;

    // تحقق من وجود المهني
    const professional = await professionalModel.findById(id);
    if (!professional) {
      return next(new AppError("المهني غير موجود", 404));
    }

    // جلب الأعمال المرتبطة بهذا المهني
    const works = await professionalWorkModel.find({ professional: id }).sort({ date: -1 });
    const total = works.length;

    return res.status(200).json({
      message: "تم جلب الأعمال بنجاح",
      total,
      works
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
      return next(new AppError("المهني غير موجود", 404));
    }

    // العثور على العمل بناءً على ID المهني و ID العمل
    const work = await professionalWorkModel.findOne({ _id: workId, professional: decoded.id });
    if (!work) {
      return next(new AppError("العمل غير موجود أو ليس لديك صلاحية لحذفه", 404));
    }

    // حذف العمل
    await professionalWorkModel.deleteOne({ _id: workId });

    return res.status(200).json({
      message: "تم حذف العمل بنجاح"
    });
 
};
//اضافة مواعيد
export const addWorkingHours = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;
  const { workingHours } = req.body;

  // تحقق من وجود التوكن
  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  // تحقق من صحة التوكن
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  // تحقق أن التوكن يخص نفس الـ ID
  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  // تحقق من البيانات المرسلة
  if (!workingHours || !Array.isArray(workingHours) || workingHours.length === 0) {
    return res.status(400).json({ message: "الرجاء إرسال مواعيد صحيحة" });
  }

  // إدخال المواعيد
  const newWorkingHours = await workingHoursModel.insertMany(
    workingHours.map(hour => ({
      professional: id,
      day: hour.day,
      time: hour.time,
      date: hour.date,
      status: hour.status || "متاح",
    }))
  );

  return res.status(201).json({
    message: "تمت إضافة المواعيد بنجاح",
    workingHours: newWorkingHours,
  });
};
//عرض المواعيد
export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  // نحدد التاريخ الحالي
  const today = moment().startOf("day");

  // تحديد بداية ونهاية الأسبوع الحالي من يوم السبت
  const startOfWeek = moment().startOf("week").isoWeekday(6); // السبت هو اليوم الأول
  const endOfWeek = moment().endOf("week").isoWeekday(5); // الجمعة هو اليوم الأخير

  // تحديد بداية ونهاية الأسبوع المقبل
  const startOfNextWeek = moment().add(1, "weeks").startOf("week").isoWeekday(6); // السبت الأسبوع المقبل
  const endOfNextWeek = moment().add(1, "weeks").endOf("week").isoWeekday(5); // الجمعة الأسبوع المقبل

  // تحديد بداية ونهاية الشهر الحالي
  const startOfMonth = moment().startOf("month"); // أول يوم في الشهر
  const endOfMonth = moment().endOf("month"); // آخر يوم في الشهر

  // جلب جميع مواعيد المهني من قاعدة البيانات
  const allWorkingHours = await workingHoursModel.find({ professional: id });

  // إنشاء مصفوفات لتخزين المواعيد بناءً على الفترة
  const currentWeek = []; // مواعيد الأسبوع الحالي
  const nextWeek = []; // مواعيد الأسبوع المقبل
  const currentMonth = []; // مواعيد الشهر الحالي

  // تصنيف المواعيد حسب الفترة الزمنية
  allWorkingHours.forEach(item => {
    const itemDate = moment(item.date, "YYYY-MM-DD"); // تحويل التاريخ إلى moment.js

    // التحقق ما إذا كان الموعد في الأسبوع الحالي
    if (itemDate.isBetween(startOfWeek, endOfWeek, "day", "[]")) {
      currentWeek.push(item);
    }

    // التحقق ما إذا كان الموعد في الأسبوع المقبل
    if (itemDate.isBetween(startOfNextWeek, endOfNextWeek, "day", "[]")) {
      nextWeek.push(item);
    }

    // التحقق ما إذا كان الموعد في الشهر الحالي
    if (itemDate.isBetween(startOfMonth, endOfMonth, "day", "[]")) {
      currentMonth.push(item);
    }
  });

  // إرسال المواعيد المصنفة في الاستجابة
  res.status(200).json({
    message: "تم عرض الأعمال بنجاح",
    currentWeek, // مواعيد الأسبوع الحالي
    nextWeek, // مواعيد الأسبوع المقبل
    currentMonth, // مواعيد الشهر الحالي
  });
};
//حذف الموعد
export const deleteWorkingHour = async (req, res) => {
  const { id } = req.params;
  const { token } = req.headers;

  // تحقق من وجود التوكن
  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  // تحقق من صحة التوكن
  const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

  // جلب الموعد من قاعدة البيانات
  const workingHour = await workingHoursModel.findById(id);

  if (!workingHour) {
    return res.status(404).json({ message: "الموعد غير موجود" });
  }

  // التحقق من أن المهني هو صاحب الموعد
  if (workingHour.professional.toString() !== decoded.id) {
    return res.status(403).json({ message: "غير مصرح لك بحذف هذا الموعد" });
  }

  // حذف الموعد
  await workingHoursModel.findByIdAndDelete(id);

  res.status(200).json({ message: "تم حذف الموعد بنجاح" });
};

  
  
  
