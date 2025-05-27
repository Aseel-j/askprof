//import professionalModel from '../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import workingHoursModel from '../../../../../DB/models/workingHours.model.js';
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
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  // تحقق أن التوكن يخص نفس الـ ID
  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  // تحقق من صحة البيانات
  if (!Array.isArray(workingHours) || workingHours.length === 0) {
    return res.status(400).json({ message: "الرجاء إرسال مواعيد صحيحة" });
  }

  const validHours = workingHours.filter(hour =>
    hour.day && hour.date && hour.startTime && hour.endTime && hour.startTime < hour.endTime
  );

  if (validHours.length === 0) {
    return res.status(400).json({ message: "جميع المواعيد غير صالحة أو مفقودة" });
  }

  const newWorkingHours = await workingHoursModel.insertMany(
    validHours.map(hour => ({
      professional: id,
      day: hour.day,
      date: hour.date,
      startTime: hour.startTime,
      endTime: hour.endTime,
      status: hour.status || "متاح",
    }))
  );

  return res.status(201).json({
    message: "تمت إضافة المواعيد بنجاح",
    workingHours: newWorkingHours,
  });
};
//عرض المواعيد
/*export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;
    // تحديد الفترات
    const startOfWeek = moment().isoWeekday(6).startOf("day"); // بداية الأسبوع الحالي - السبت
    const endOfWeek = moment(startOfWeek).add(6, "days").endOf("day"); // نهاية الجمعة

    const startOfNextWeek = moment(startOfWeek).add(7, "days").startOf("day"); // السبت القادم
    const endOfNextWeek = moment(startOfNextWeek).add(6, "days").endOf("day"); // الجمعة القادمة

    const startOfMonth = moment().startOf("month").startOf("day");
    const endOfMonth = moment().endOf("month").endOf("day");

    // جلب مواعيد الشهر فقط لتقليل وقت المعالجة
    const monthWorkingHours = await workingHoursModel.find({
      professional: id,
      date: {
        $gte: startOfMonth.toDate(),
        $lte: endOfMonth.toDate()
      }
    }).lean();

    const currentWeek = [];
    const nextWeek = [];
    const currentMonth = [...monthWorkingHours]; // كل المواعيد في الشهر

    // تقسيم المواعيد
    for (const item of monthWorkingHours) {
      const itemDate = moment(item.date).startOf("day");

      if (itemDate.isBetween(startOfWeek, endOfWeek, null, "[]")) {
        currentWeek.push(item);
      } else if (itemDate.isBetween(startOfNextWeek, endOfNextWeek, null, "[]")) {
        nextWeek.push(item);
      }
    }

    return res.status(200).json({
      message: "تم عرض المواعيد بنجاح",
      currentWeek,
      nextWeek,
      currentMonth
    });

  
};*/
// عرض المواعيد للأسبوع الحالي والقادم فقط
/*export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  const startOfWeek = moment().isoWeekday(6).startOf("day"); // بداية السبت الحالي
  const endOfNextWeek = moment(startOfWeek).add(13, "days").endOf("day"); // نهاية الجمعة القادمة

  // جلب المواعيد بين السبت الحالي إلى الجمعة القادمة
  const workingHours = await workingHoursModel.find({
    professional: id,
    date: {
      $gte: startOfWeek.toDate(),
      $lte: endOfNextWeek.toDate()
    }
  }).lean();

  const currentWeek = [];
  const nextWeek = [];

  const endOfWeek = moment(startOfWeek).add(6, "days").endOf("day"); // نهاية الجمعة الحالية
  const startOfNextWeek = moment(startOfWeek).add(7, "days").startOf("day"); // بداية السبت القادم
  const endOfNextWeekRef = moment(startOfNextWeek).add(6, "days").endOf("day"); // نهاية الجمعة القادمة

  for (const item of workingHours) {
    const itemDate = moment(item.date).startOf("day");

    if (itemDate.isBetween(startOfWeek, endOfWeek, null, "[]")) {
      currentWeek.push(item);
    } else if (itemDate.isBetween(startOfNextWeek, endOfNextWeekRef, null, "[]")) {
      nextWeek.push(item);
    }
  }

  return res.status(200).json({
    message: "تم عرض المواعيد بنجاح",
    currentWeek,
    nextWeek
  });
};*/
// عرض المواعيد لأربع أسابيع متتالية
export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  // حساب بداية الأسبوع الأول (السبت الحالي)
  const startOfWeek1 = moment().isoWeekday(6).startOf("day");

  // حساب نهاية الأسبوع الرابع (الجمعة بعد 27 يوم)
  const endOfWeek4 = moment(startOfWeek1).add(27, "days").endOf("day");

  // جلب المواعيد خلال الأربع أسابيع فقط
  const workingHours = await workingHoursModel.find({
    professional: id,
    date: {
      $gte: startOfWeek1.toDate(),
      $lte: endOfWeek4.toDate()
    }
  }).lean();

  // إنشاء مصفوفات الأسابيع الأربعة
  const week1 = [];
  const week2 = [];
  const week3 = [];
  const week4 = [];

  for (const item of workingHours) {
    const itemDate = moment(item.date).startOf("day");

    const start1 = moment(startOfWeek1).startOf("day");
    const end1 = moment(start1).add(6, "days").endOf("day");

    const start2 = moment(start1).add(7, "days").startOf("day");
    const end2 = moment(start2).add(6, "days").endOf("day");

    const start3 = moment(start2).add(7, "days").startOf("day");
    const end3 = moment(start3).add(6, "days").endOf("day");

    const start4 = moment(start3).add(7, "days").startOf("day");
    const end4 = moment(start4).add(6, "days").endOf("day");

    if (itemDate.isBetween(start1, end1, null, "[]")) {
      week1.push(item);
    } else if (itemDate.isBetween(start2, end2, null, "[]")) {
      week2.push(item);
    } else if (itemDate.isBetween(start3, end3, null, "[]")) {
      week3.push(item);
    } else if (itemDate.isBetween(start4, end4, null, "[]")) {
      week4.push(item);
    }
  }

  return res.status(200).json({
    message: "تم عرض المواعيد بنجاح",
    week1, // الأسبوع الحالي
    week2, // الأسبوع القادم
    week3, // الأسبوع بعد القادم
    week4  // الأسبوع الرابع
  });
};


//حذف الموعد
export const deleteWorkingHour = async (req, res) => {
  const { id } = req.params;
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  // حذف الموعد مع التحقق من أنه يخص المهني (بـ professional = decoded.id)
  const deleted = await workingHoursModel.findOneAndDelete({
    _id: id,
    professional: decoded.id,
  });

  if (!deleted) {
    return res.status(404).json({ message: "الموعد غير موجود أو غير مصرح لك بحذفه" });
  }

  return res.status(200).json({ message: "تم حذف الموعد بنجاح" });
};
