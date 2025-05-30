import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import ActiveBookingModel from '../../../DB/models/activeBooking.model.js';
import workingHoursModel from '../../../DB/models/workingHours.model.js';
import userModel from '../../../DB/models/user.model.js';
import professionalModel from '../../../DB/models/professional.model.js';
import InactiveBookingModel from '../../../DB/models/inactiveBookingSchema.model.js';
import { sendEmail } from '../../utils/SendEmail.js';
// انشاء حجز
/*export const createBooking = async (req, res) => {
  const { token } = req.headers;
  const { bookingDate, startTime, endTime, bookingDetails } = req.body;
  const { professionalId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }
  const userId = decoded.id;

  // تحقق من صحة معرف المهني
  if (!mongoose.Types.ObjectId.isValid(professionalId)) {
    return res.status(400).json({ message: "معرف المهني غير صالح" });
  }
  const profObjectId = new mongoose.Types.ObjectId(professionalId);

  // تحقق من صحة التاريخ "dd-mm-yyyy"
  const [day, month, year] = bookingDate.split("-").map(Number);
  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 ||
    month < 1 || month > 12 ||
    year < 2000 || year > 2100
  ) {
    return res.status(400).json({ message: "تاريخ غير صالح، تأكد من اليوم والشهر والسنة" });
  }

  // تحويل التاريخ إلى كائن Date مضبوط بتوقيت UTC (منتصف الليل)
  const bookingDateObj = new Date(Date.UTC(year, month - 1, day));

  // تحقق من صحة الوقت (صيغة hh:mm)
  const timeFormatValid = (timeStr) => /^\d{1,2}:\d{2}$/.test(timeStr);
  if (!timeFormatValid(startTime) || !timeFormatValid(endTime)) {
    return res.status(400).json({ message: "صيغة الوقت غير صحيحة. استخدم hh:mm" });
  }

  // تأكد أن وقت البدء قبل وقت الانتهاء
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return res.status(400).json({ message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" });
  }

  // تحقق من صلاحية المستخدم
  const user = await userModel.findById(userId).select("usertype");
  if (!user || user.usertype !== "مستخدم") {
    return res.status(403).json({ message: "صلاحيات غير كافية" });
  }

  // تحقق إذا يوجد حجز سابق لنفس المستخدم، المهني، والتاريخ والوقت
  const existingBooking = await ActiveBookingModel.findOne({
    userId,
    professionalId: profObjectId,
    bookingDate: bookingDateObj,
    startTime,
    endTime,
  });

  if (existingBooking) {
    return res.status(409).json({ message: "لديك حجز مسبق في هذا الموعد" });
  }

  // تحقق وتحديث حالة الموعد في جدول المواعيد (workingHoursModel)
  const slot = await workingHoursModel.findOneAndUpdate(
    {
      professional: profObjectId,
      date: bookingDateObj,
      startTime,
      endTime,
      status: "متاح",
    },
    { $set: { status: "محجوز" } },
    { new: true }
  );

  if (!slot) {
    return res.status(404).json({ message: "هذا الموعد غير متاح أو محجوز" });
  }

  // إنشاء الحجز الجديد
  const newBooking = new ActiveBookingModel({
    bookingDate: bookingDateObj,
    startTime,
    endTime,
    professionalId: profObjectId,
    userId,
    bookingDetails,
  });

  await newBooking.save();

  return res.status(201).json({
    message: "تم إنشاء الحجز وتحديث حالة الموعد",
    booking: newBooking,
  });
};
*/
export const createBooking = async (req, res) => {
  const { token } = req.headers;
  const { bookingDate, startTime, endTime, bookingDetails } = req.body;
  const { professionalId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  // تحويل professionalId إلى ObjectId
  const profObjectId = new mongoose.Types.ObjectId(professionalId);

  // تحويل التاريخ إلى كائن Date مضبوط بتوقيت UTC
  const [day, month, year] = bookingDate.split("-").map(Number);
  const bookingDateObj = new Date(Date.UTC(year, month - 1, day));

  // تأكد أن وقت البدء قبل وقت الانتهاء
  const timeToMinutes = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return res.status(400).json({ message: "وقت البدء يجب أن يكون قبل وقت الانتهاء" });
  }

  // تحقق من صلاحية المستخدم
  const user = await userModel.findById(userId).select("usertype");
  if (!user || user.usertype !== "مستخدم") {
    return res.status(403).json({ message: "صلاحيات غير كافية" });
  }

  // تحقق من وجود حجز مسبق
  const existingBooking = await ActiveBookingModel.findOne({
    userId,
    professionalId: profObjectId,
    bookingDate: bookingDateObj,
    startTime,
    endTime,
  });

  if (existingBooking) {
    return res.status(409).json({ message: "لديك حجز مسبق في هذا الموعد" });
  }

  // تحديث الموعد في جدول المواعيد
  const slot = await workingHoursModel.findOneAndUpdate(
    {
      professional: profObjectId,
      date: bookingDateObj,
      startTime,
      endTime,
      status: "متاح",
    },
    { $set: { status: "محجوز" } },
    { new: true }
  );

  if (!slot) {
    return res.status(404).json({ message: "هذا الموعد غير متاح أو محجوز" });
  }

  // إنشاء الحجز
  const newBooking = new ActiveBookingModel({
    bookingDate: bookingDateObj,
    startTime,
    endTime,
    professionalId: profObjectId,
    userId,
    bookingDetails,
  });

  await newBooking.save();

  return res.status(201).json({
    message: "تم إنشاء الحجز وتحديث حالة الموعد",
    booking: newBooking,
  });
};
//عرض الحجوزات 
/*export const getBookings = async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ message: "التوكن مفقود" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  // جلب المستخدم والمهني بالتوازي
  const [user, professional] = await Promise.all([
    userModel.findById(userId).select("usertype"),
    professionalModel.findById(userId).select("usertype governorate").populate("governorate", "name"),
  ]);

  if (!user && !professional)
    return res.status(404).json({ message: "المستخدم غير موجود" });

  let bookings, formatted;

  //  إذا كان مهني
  if (professional && professional.usertype === "مهني") {
    bookings = await ActiveBookingModel.find({ professionalId: userId })
      .populate("userId", "username email phoneNumber")
      .sort({ bookingDate: -1 }) // ترتيب حسب الأحدث
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id.toString(),
      userName: b.userId?.username ?? "غير معروف",
      userEmail: b.userId?.email ?? "غير معروف",
      userPhone: b.userId?.phoneNumber ?? "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      time: `${b.startTime}-${b.endTime}`,  // دمج الوقت
    }));

  //  إذا كان مستخدم
  } else if (user && user.usertype === "مستخدم") {
    bookings = await ActiveBookingModel.find({ userId })
      .populate({
        path: "professionalId",
        select: "username professionField governorate",
        populate: { path: "governorate", select: "name" },
      })
      .sort({ bookingDate: -1 }) // ترتيب حسب الأحدث
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id.toString(),
      professionalName: b.professionalId?.username ?? "غير معروف",
      professionField: b.professionalId?.professionField ?? "غير معروف",
      governorate: b.professionalId?.governorate?.name ?? "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      time: `${b.startTime}-${b.endTime}`,  // دمج الوقت
    }));

  } else {
    return res.status(403).json({ message: "نوع المستخدم غير مسموح" });
  }

  return res.json({ bookings: formatted });
};*/
export const getBookings = async (req, res) => {
  const { token } = req.headers;
  if (!token) return res.status(401).json({ message: "التوكن مفقود" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  // جلب المستخدم والمهني بالتوازي
  const [user, professional] = await Promise.all([
    userModel.findById(userId).select("usertype"),
    professionalModel.findById(userId).select("usertype governorate").populate("governorate", "name"),
  ]);

  if (!user && !professional)
    return res.status(404).json({ message: "المستخدم غير موجود" });

  // تحديد بداية اليوم (منتصف الليل) لتصفية التواريخ
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let bookings = [];
  let formatted = [];

  //  إذا كان مهني
  if (professional && professional.usertype === "مهني") {
    bookings = await ActiveBookingModel.find({
      professionalId: userId,
      bookingDate: { $gte: today } // الحجوزات اليوم وما بعده
    })
      .populate("userId", "username email phoneNumber")
      .sort({ bookingDate: -1 })
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id.toString(),
      userName: b.userId?.username ?? "غير معروف",
      userEmail: b.userId?.email ?? "غير معروف",
      userPhone: b.userId?.phoneNumber ?? "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      time: `${b.startTime}-${b.endTime}`,
    }));

  //  إذا كان مستخدم
  } else if (user && user.usertype === "مستخدم") {
    bookings = await ActiveBookingModel.find({
      userId,
      bookingDate: { $gte: today } // الحجوزات اليوم وما بعده
    })
      .populate({
        path: "professionalId",
        select: "username professionField governorate",
        populate: { path: "governorate", select: "name" },
      })
      .sort({ bookingDate: -1 })
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id.toString(),
      professionalName: b.professionalId?.username ?? "غير معروف",
      professionField: b.professionalId?.professionField ?? "غير معروف",
      governorate: b.professionalId?.governorate?.name ?? "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      startTime: b.startTime,
      endTime: b.endTime,
      time: `${b.startTime}-${b.endTime}`,
    }));

  } else {
    return res.status(403).json({ message: "نوع المستخدم غير مسموح" });
  }

  return res.json({ bookings: formatted });
};
// إلغاء الحجز
export const cancelBooking = async (req, res, next) => {
  const { token } = req.headers;
  const { bookingId } = req.params;
  const { cancellationReason } = req.body;

  if (!token) return res.status(401).json({ message: "التوكن مفقود" });
  if (!cancellationReason || !cancellationReason.trim())
    return res.status(400).json({ message: "يرجى إدخال سبب الإلغاء" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (!mongoose.Types.ObjectId.isValid(bookingId))
    return res.status(400).json({ message: "معرف الحجز غير صالح" });

  const activeBooking = await ActiveBookingModel.findById(bookingId)
    .populate("userId", "username email")
    .populate("professionalId", "username email")
    .lean();

  if (!activeBooking)
    return res.status(404).json({ message: "الحجز غير موجود" });

  const userId = decoded.id;

  if (
    activeBooking.userId._id.toString() !== userId &&
    activeBooking.professionalId._id.toString() !== userId
  ) {
    return res.status(403).json({ message: "غير مخول لإلغاء هذا الحجز" });
  }

  // إنشاء نسخة الحجز الملغى وحفظها
  const cancelledBooking = await InactiveBookingModel.create({
    bookingDate: activeBooking.bookingDate,
    startTime: activeBooking.startTime,
    endTime: activeBooking.endTime,
    professionalId: activeBooking.professionalId._id,
    userId: activeBooking.userId._id,
    bookingDetails: activeBooking.bookingDetails,
    cancellationReason,
  });

  // ضبط بداية اليوم
  const startOfDay = new Date(activeBooking.bookingDate);
  startOfDay.setUTCHours(0, 0, 0, 0);

  // تحديث الموعد إلى متاح
  const updatedSlot = await workingHoursModel.findOneAndUpdate(
    {
      professional: activeBooking.professionalId._id,
      date: startOfDay,
      startTime: activeBooking.startTime,
      endTime: activeBooking.endTime,
    },
    { status: "متاح" },
    { new: true }
  );

  if (!updatedSlot) {
    console.warn("لم يتم العثور على الموعد لتحديثه إلى متاح");
  }

  // حذف الحجز النشط
  await ActiveBookingModel.deleteOne({ _id: bookingId });

  res.status(200).json({
    message:
      "تم إلغاء الحجز، إعادة حالة الموعد للإتاحة، وإرسال ايميل بالإلغاء للطرف الآخر فقط",
    cancelledBooking,
  });

  // إرسال الإيميلات بالخلفية بدون انتظار الرد
  const timeText = `${activeBooking.startTime} - ${activeBooking.endTime}`;
  const dateText = new Date(activeBooking.bookingDate).toLocaleDateString("ar-EG");

  setImmediate(async () => {
    try {
      if (userId === cancelledBooking.userId.toString()) {
        const htmlProfessional = `
          <div>
            <h1>مرحبًا ${activeBooking.professionalId.username}</h1>
            <h2> تم إلغاء حجز معك</h2>
            <p> تم إلغاء الحجز مع المستخدم <strong> ${activeBooking.userId.username} </strong> بتاريخ ${dateText} والوقت ${timeText}.</p>
            <p> سبب الإلغاء: ${cancellationReason}</p>
          </div>`;
        await sendEmail(
          activeBooking.professionalId.email,
          " تم إلغاء حجز معك",
          htmlProfessional
        );
      } else if (userId === cancelledBooking.professionalId.toString()) {
        const htmlUser = `
          <div>
            <h1> مرحبًا ${activeBooking.userId.username}</h1>
            <h2> تم إلغاء حجزك</h2>
            <p> تم إلغاء الحجز مع <strong>  ${activeBooking.professionalId.username}  </strong> بتاريخ ${dateText} والوقت ${timeText}.</p>
            <p> سبب الإلغاء: ${cancellationReason}</p>
          </div>`;
        await sendEmail(
          activeBooking.userId.email,
          " تم إلغاء حجزك",
          htmlUser
        );
      }
    } catch (err) {
      console.error("فشل إرسال البريد:", err);
    }
  });
};
//عرض الحجوزات الملغية
export const getDeletedBookings = async (req, res) => {
  const { token } = req.headers;

  if (!token) return res.status(401).json({ message: "التوكن مفقود" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  const [user, professional] = await Promise.all([
    userModel.findById(userId).select("usertype"),
    professionalModel.findById(userId).select("usertype governorate").populate("governorate", "name"),
  ]);

  if (!user && !professional)
    return res.status(404).json({ message: "المستخدم غير موجود" });

  // تحديد بداية اليوم الحالي
  const today = new Date();
  today.setHours(0, 0, 0, 0); // تصفير الوقت لمقارنة دقيقة

  let bookings = [];
  let formatted = [];

  if (professional && professional.usertype === "مهني") {
    bookings = await InactiveBookingModel.find({
      professionalId: userId,
      bookingDate: { $gte: today }, // الحجوزات من اليوم وما بعده فقط
    })
      .populate("userId", "username email phoneNumber")
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id,
      userName: b.userId?.username || "غير معروف",
      userEmail: b.userId?.email || "غير معروف",
      userPhone: b.userId?.phoneNumber || "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      time: `${b.startTime}-${b.endTime}`,
      cancellationReason: b.cancellationReason || "غير محدد",
    }));

  } else if (user && user.usertype === "مستخدم") {
    bookings = await InactiveBookingModel.find({
      userId,
      bookingDate: { $gte: today }, // الحجوزات من اليوم وما بعده فقط
    })
      .populate({
        path: "professionalId",
        select: "username professionField governorate",
        populate: { path: "governorate", select: "name" },
      })
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id,
      professionalName: b.professionalId?.username || "غير معروف",
      professionField: b.professionalId?.professionField || "غير معروف",
      governorate: b.professionalId?.governorate?.name || "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      time: `${b.startTime}-${b.endTime}`,
      cancellationReason: b.cancellationReason || "غير محدد",
    }));

  } else {
    return res.status(403).json({ message: "نوع المستخدم غير مسموح" });
  }

  return res.json({ deletedBookings: formatted });
};
/*export const getDeletedBookings = async (req, res) => {
  const { token } = req.headers;

  if (!token) return res.status(401).json({ message: "التوكن مفقود" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  // جلب المستخدم والمهني بالتوازي لتقليل الزمن
  const [user, professional] = await Promise.all([
    userModel.findById(userId).select("usertype"),
    professionalModel.findById(userId).select("usertype governorate").populate("governorate", "name"),
  ]);

  // تحقق من وجود المستخدم أو المهني
  if (!user && !professional)
    return res.status(404).json({ message: "المستخدم غير موجود" });

  let bookings, formatted;

  // إذا كان مهني
  if (professional && professional.usertype === "مهني") {
    bookings = await InactiveBookingModel.find({ professionalId: userId })
      .populate("userId", "username email phoneNumber")
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id,
      userName: b.userId?.username || "غير معروف",
      userEmail: b.userId?.email || "غير معروف",
      userPhone: b.userId?.phoneNumber || "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate, // التاريخ كما هو مخزن
       time: `${b.startTime}-${b.endTime}`,
      cancellationReason: b.cancellationReason || "غير محدد",
    }));

  // إذا كان مستخدم عادي
  } else if (user && user.usertype === "مستخدم") {
    bookings = await InactiveBookingModel.find({ userId })
      .populate({
        path: "professionalId",
        select: "username professionField governorate",
        populate: { path: "governorate", select: "name" },
      })
      .lean();

    formatted = bookings.map(b => ({
      bookingId: b._id,
      professionalName: b.professionalId?.username || "غير معروف",
      professionField: b.professionalId?.professionField || "غير معروف",
      governorate: b.professionalId?.governorate?.name || "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate, // التاريخ كما هو مخزن
       time: `${b.startTime}-${b.endTime}`,
      cancellationReason: b.cancellationReason || "غير محدد",
    }));

  } else {
    return res.status(403).json({ message: "نوع المستخدم غير مسموح" });
  }

  return res.json({ deletedBookings: formatted });
};*/