import jwt from 'jsonwebtoken';
import mongoose from "mongoose";
import ActiveBookingModel from '../../../DB/models/activeBooking.model.js';
import workingHoursModel from '../../../DB/models/workingHours.model.js';
import userModel from '../../../DB/models/user.model.js';
import professionalModel from '../../../DB/models/professional.model.js';
import InactiveBookingModel from '../../../DB/models/inactiveBookingSchema.model.js';
import { sendEmail } from '../../utils/SendEmail.js';
//حجز
export const createBooking = async (req, res) => {
  const { token } = req.headers;
  const { bookingDate, bookingTime, bookingDetails } = req.body;
  const { professionalId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  // تحقق من التوكن
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }
  const userId = decoded.id;

  // تحقق من البيانات
  if (!bookingDate || !bookingTime || !bookingDetails) {
    return res.status(400).json({ message: "يرجى إدخال جميع البيانات المطلوبة" });
  }

  // تحقق من صحة ObjectId
  if (!mongoose.Types.ObjectId.isValid(professionalId)) {
    return res.status(400).json({ message: "معرف المهني غير صالح" });
  }
  const profObjectId = new mongoose.Types.ObjectId(professionalId);

  // تحليل التاريخ "dd-mm-yyyy"
  const [day, month, year] = bookingDate.split("-").map(Number);
  if (
    isNaN(day) || isNaN(month) || isNaN(year) ||
    day < 1 || day > 31 || month < 1 || month > 12 || year < 2000 || year > 2100
  ) {
    return res.status(400).json({ message: "تاريخ غير صالح، تأكد من اليوم والشهر والسنة" });
  }

  const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));

  // البحث وتحديث الحالة في نفس الوقت
  const slot = await workingHoursModel.findOneAndUpdate(
    {
      professional: profObjectId,
      date: { $gte: startOfDay, $lte: endOfDay },
      time: bookingTime,
      status: "متاح",
    },
    {
      $set: { status: "محجوز" },
    },
    { new: true } // يرجع النسخة الجديدة بعد التحديث
  );

  if (!slot) {
    return res.status(404).json({ message: "هذا الموعد غير متاح أو غير موجود في جدول المواعيد" });
  }

  // إنشاء الحجز
  const newBooking = new ActiveBookingModel({
    bookingDate: startOfDay,
    bookingTime,
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

  const user = await userModel.findById(userId);
  if (!user) {
    const professional = await professionalModel.findById(userId);
    if (!professional)
      return res.status(404).json({ message: "المستخدم غير موجود" });

    if (professional.usertype !== "مهني")
      return res.status(403).json({ message: "نوع المستخدم غير مسموح" });

    // مهني - عرض الحجوزات مع بيانات المستخدمين
    const bookings = await ActiveBookingModel.find({ professionalId: userId })
      .populate("userId", "username email phoneNumber")
      .lean();

    const formatted = bookings.map(b => ({
      userName: b.userId?.username || "غير معروف",
      userEmail: b.userId?.email || "غير معروف",
      userPhone: b.userId?.phoneNumber || "غير معروف",
      bookingDetails: b.bookingDetails,
      bookingDate: b.bookingDate,
      bookingTime: b.bookingTime,
    }));

    return res.json({ bookings: formatted });
  }

  // مستخدم - عرض الحجوزات مع بيانات المهني
  if (user.usertype !== "مستخدم")
    return res.status(403).json({ message: "نوع المستخدم غير مسموح" });

  const bookings = await ActiveBookingModel.find({ userId })
    .populate("professionalId", "username professionField governorate")
    .lean();

  const formatted = bookings.map(b => ({
    professionalName: b.professionalId?.username || "غير معروف",
    professionField: b.professionalId?.professionField || "غير معروف",
    governorate: b.professionalId?.governorate || "غير معروف",
    bookingDetails: b.bookingDetails,
    bookingDate: b.bookingDate,
    bookingTime: b.bookingTime,
  }));

  return res.json({ bookings: formatted });
};
//الغاء الحجز 
export const cancelBooking = async (req, res) => {
  const { token } = req.headers;
  const { bookingId } = req.params;
  const { cancellationReason } = req.body;

  if (!token) 
    return res.status(401).json({ message: "التوكن مفقود" });

  if (!cancellationReason || cancellationReason.trim() === "")
    return res.status(400).json({ message: "يرجى إدخال سبب الإلغاء" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  const userId = decoded.id;

  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    return res.status(400).json({ message: "معرف الحجز غير صالح" });
  }

  const activeBooking = await ActiveBookingModel.findById(bookingId);
  if (!activeBooking) {
    return res.status(404).json({ message: "الحجز غير موجود" });
  }

  if (
    activeBooking.userId.toString() !== userId &&
    activeBooking.professionalId.toString() !== userId
  ) {
    return res.status(403).json({ message: "غير مخول لإلغاء هذا الحجز" });
  }

  // إنشاء نسخة ملغاة من الحجز
  const cancelledBooking = new InactiveBookingModel({
    bookingDate: activeBooking.bookingDate,
    professionalId: activeBooking.professionalId,
    userId: activeBooking.userId,
    bookingDetails: activeBooking.bookingDetails,
    cancellationReason,
  });

  await cancelledBooking.save();

  // تحديث حالة الموعد إلى متاح
  await workingHoursModel.findOneAndUpdate(
    {
      professional: activeBooking.professionalId,
      date: activeBooking.bookingDate,
      time: activeBooking.bookingTime,
    },
    { status: "متاح" }
  );

  // حذف الحجز النشط
  await activeBooking.deleteOne();

  // جلب بيانات المهني والمستخدم للإرسال بالبريد
  const professional = await professionalModel.findById(cancelledBooking.professionalId);
  const user = await userModel.findById(cancelledBooking.userId);

  // إرسال البريد للطرف الآخر فقط
  if (userId === cancelledBooking.userId.toString()) {
    // من ألغى الحجز هو المستخدم => نرسل للمهني فقط
    const htmlProfessional = `
      <div>
        <h1>مرحبا ${professional.username}</h1>
        <h2>تم إلغاء حجز معك</h2>
        <p>تم إلغاء الحجز مع المستخدم <strong>${user.username}</strong> بتاريخ 
        ${cancelledBooking.bookingDate.toLocaleDateString()} والوقت ${activeBooking.bookingTime}.</p>
        <p>سبب الإلغاء: ${cancellationReason}</p>
      </div>`;
    await sendEmail(professional.email, "تم إلغاء حجز معك", htmlProfessional);
  } else if (userId === cancelledBooking.professionalId.toString()) {
    // من ألغى الحجز هو المهني => نرسل للمستخدم فقط
    const htmlUser = `
      <div>
        <h1>مرحبا ${user.username}</h1>
        <h2>تم إلغاء حجزك</h2>
        <p>تم إلغاء الحجز مع <strong>${professional.username}</strong> بتاريخ 
        ${cancelledBooking.bookingDate.toLocaleDateString()} والوقت ${activeBooking.bookingTime}.</p>
        <p>سبب الإلغاء: ${cancellationReason}</p>
      </div>`;
    await sendEmail(user.email, "تم إلغاء حجزك", htmlUser);
  }

  return res.status(200).json({
    message: "تم إلغاء الحجز، إعادة حالة الموعد للإتاحة، وإرسال إشعار بالإلغاء للطرف الآخر فقط",
    cancelledBooking,
  });
};