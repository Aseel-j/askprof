//import professionalModel from '../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import workingHoursModel from '../../../../DB/models/workingHours.model.js';
import moment from "moment";


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