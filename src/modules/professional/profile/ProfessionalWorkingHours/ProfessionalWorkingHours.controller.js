//import professionalModel from '../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import workingHoursModel from '../../../../../DB/models/workingHours.model.js';
import moment from "moment";
import { addWorkingHoursSchema } from './ProfessionalWorkingHours.validation.js';
//اضافة مواعيد
/*export const addWorkingHours = async (req, res) => {
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

  // تحقق أن التوكن لمهني فقط
  if (decoded.usertype !== "مهني") {
    return res.status(403).json({ message: "هذا الإجراء مسموح للمهنيين فقط" });
  }

  // التحقق من صحة البيانات عبر Joi
  const { error } = addWorkingHoursSchema.validate({ workingHours }, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "خطأ في البيانات المدخلة",
      errors: error.details.map(e => e.message)
    });
  }

  // تحقق من المواعيد المكررة
  const duplicates = [];

  for (const hour of workingHours) {
    const exists = await workingHoursModel.findOne({
      professional: id,
      date: hour.date,
      startTime: hour.startTime,
      endTime: hour.endTime
    });

    if (exists) {
      duplicates.push(`${hour.date} من ${hour.startTime} إلى ${hour.endTime}`);
    }
  }

  if (duplicates.length > 0) {
    return res.status(409).json({
      message: "بعض المواعيد مكررة ولا يمكن إضافتها",
      duplicates
    });
  }

  // إدخال المواعيد الجديدة
  const newWorkingHours = await workingHoursModel.insertMany(
    workingHours.map(hour => ({
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
};*/
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

  // تحقق أن التوكن لمهني فقط
  if (decoded.usertype !== "مهني") {
    return res.status(403).json({ message: "هذا الإجراء مسموح للمهنيين فقط" });
  }

  // التحقق من صحة البيانات عبر Joi
  const { error } = addWorkingHoursSchema.validate({ workingHours }, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "خطأ في البيانات المدخلة",
      errors: error.details.map(e => e.message)
    });
  }

  const today = moment().startOf("day");
  const pastDates = [];
  const duplicates = [];

  for (const hour of workingHours) {
    const hourDate = moment(hour.date).startOf("day");

    // تحقق من أن التاريخ ليس في الماضي
    if (hourDate.isBefore(today)) {
      pastDates.push(`${hour.date} من ${hour.startTime} إلى ${hour.endTime}`);
      continue;
    }

    // تحقق من التكرار
    const exists = await workingHoursModel.findOne({
      professional: id,
      date: hour.date,
      startTime: hour.startTime,
      endTime: hour.endTime
    });

    if (exists) {
      duplicates.push(`${hour.date} من ${hour.startTime} إلى ${hour.endTime}`);
    }
  }

  if (pastDates.length > 0) {
    return res.status(400).json({
      message: "لا يمكن إدخال مواعيد بتاريخ مضى",
      pastDates
    });
  }

  if (duplicates.length > 0) {
    return res.status(409).json({
      message: "بعض المواعيد مكررة ولا يمكن إضافتها",
      duplicates
    });
  }

  // إدخال المواعيد الجديدة
  const newWorkingHours = await workingHoursModel.insertMany(
    workingHours.map(hour => ({
      professional: id,
      day: hour.day,
      date: hour.date,
      startTime: hour.startTime,
      endTime: hour.endTime,
      status: hour.status || "متاح",
    })).filter(hour => !moment(hour.date).startOf("day").isBefore(today)) // تأكيد أخير
  );

  return res.status(201).json({
    message: "تمت إضافة المواعيد بنجاح",
    workingHours: newWorkingHours,
  });
};
// عرض المواعيد لأربع أسابيع متتالية
/*export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  // جعل السبت بداية الأسبوع الحالي: إذا كان اليوم قبل السبت، اذهب للسبت الماضي
  const today = moment().startOf("day");
  const dayOfWeek = today.isoWeekday(); // 1 = الاثنين ... 6 = السبت
  const daysSinceSaturday = (dayOfWeek >= 6) ? (dayOfWeek - 6) : (dayOfWeek + 1);
  const startOfWeek1 = today.clone().subtract(daysSinceSaturday, "days");

  // نهاية الأسبوع الرابع (الجمعة بعد 27 يوم من السبت الأول)
  const endOfWeek4 = moment(startOfWeek1).add(27, "days").endOf("day");

  // جلب المواعيد خلال الأربع أسابيع
  const workingHours = await workingHoursModel.find({
    professional: id,
    date: {
      $gte: startOfWeek1.toDate(),
      $lte: endOfWeek4.toDate()
    }
  }).lean();

  // تحضير الأسابيع الأربعة
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
    week1,
    week2,
    week3,
    week4
  });
};*/
// عرض المواعيد لأربع أسابيع متتالية بدون التواريخ التي مضت
/*export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  // جعل السبت بداية الأسبوع الحالي
  const today = moment().startOf("day");
  const dayOfWeek = today.isoWeekday(); // 1 = الاثنين ... 6 = السبت
  const daysSinceSaturday = (dayOfWeek >= 6) ? (dayOfWeek - 6) : (dayOfWeek + 1);
  const startOfWeek1 = today.clone().subtract(daysSinceSaturday, "days");

  // نهاية الأسبوع الرابع
  const endOfWeek4 = moment(startOfWeek1).add(27, "days").endOf("day");

  // جلب المواعيد
  const workingHours = await workingHoursModel.find({
    professional: id,
    date: {
      $gte: startOfWeek1.toDate(),
      $lte: endOfWeek4.toDate()
    }
  }).lean();

  // تحضير الأسابيع الأربعة
  const week1 = [];
  const week2 = [];
  const week3 = [];
  const week4 = [];

  for (const item of workingHours) {
    const itemDate = moment(item.date).startOf("day");

    // تجاهل التواريخ التي مضت
    if (itemDate.isBefore(today)) {
      continue;
    }

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
    week1,
    week2,
    week3,
    week4
  });
};*/
export const getWorkingHoursByPeriods = async (req, res) => {
  const { id } = req.params;

  const now = moment(); // الوقت الحالي بدقة (تاريخ + ساعة + دقيقة)

  // جعل السبت بداية الأسبوع الحالي
  const today = moment().startOf("day");
  const dayOfWeek = today.isoWeekday(); // 1=الإثنين ... 6=السبت
  // حساب عدد الأيام منذ السبت
  const daysSinceSaturday = (dayOfWeek >= 6) ? (dayOfWeek - 6) : (dayOfWeek + 1);
  const startOfWeek1 = today.clone().subtract(daysSinceSaturday, "days");

  // نهاية الأسبوع الرابع (27 يوم من بداية الأسبوع الأول)
  const endOfWeek4 = moment(startOfWeek1).add(27, "days").endOf("day");

  // جلب المواعيد من قاعدة البيانات بين بداية الأسبوع الأول ونهاية الأسبوع الرابع
  const workingHours = await workingHoursModel.find({
    professional: id,
    date: {
      $gte: startOfWeek1.toDate(),
      $lte: endOfWeek4.toDate()
    }
  }).lean();

  // تحضير المصفوفات للأسابيع الأربعة
  const week1 = [];
  const week2 = [];
  const week3 = [];
  const week4 = [];

  // تحديد بدايات ونهايات الأسابيع الأربعة
  const start1 = moment(startOfWeek1).startOf("day");
  const end1 = moment(start1).add(6, "days").endOf("day");

  const start2 = moment(start1).add(7, "days").startOf("day");
  const end2 = moment(start2).add(6, "days").endOf("day");

  const start3 = moment(start2).add(7, "days").startOf("day");
  const end3 = moment(start3).add(6, "days").endOf("day");

  const start4 = moment(start3).add(7, "days").startOf("day");
  const end4 = moment(start4).add(6, "days").endOf("day");

  for (const item of workingHours) {
    // بناء الوقت الكامل للموعد: التاريخ + وقت البداية
    let itemDateTime = moment(item.date);

    if (item.startTime) {
      // افتراض أن startTime مثل "14:30"
      const [hour, minute] = item.startTime.split(":").map(Number);
      itemDateTime = itemDateTime.set({ hour, minute, second: 0, millisecond: 0 });
    } else {
      // إذا ما في وقت محدد، نعتبر بداية اليوم (00:00)
      itemDateTime = itemDateTime.startOf("day");
    }

    // تجاهل المواعيد التي مضى وقتها (بما في ذلك اليوم إذا مضى الوقت)
    if (itemDateTime.isBefore(now)) {
      continue;
    }

    // تصنيف الموعد في الأسبوع المناسب
    if (itemDateTime.isBetween(start1, end1, null, "[]")) {
      week1.push(item);
    } else if (itemDateTime.isBetween(start2, end2, null, "[]")) {
      week2.push(item);
    } else if (itemDateTime.isBetween(start3, end3, null, "[]")) {
      week3.push(item);
    } else if (itemDateTime.isBetween(start4, end4, null, "[]")) {
      week4.push(item);
    }
  }

  return res.status(200).json({
    message: "تم عرض المواعيد بنجاح",
    week1,
    week2,
    week3,
    week4
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
