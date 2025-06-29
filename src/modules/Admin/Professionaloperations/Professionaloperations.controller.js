import professionalModel from "../../../../DB/models/professional.model.js";
import ReviewModel from "../../../../DB/models/review.model.js";
import DeletedProfessionalModel from "../../../../DB/models/deletedProfessional.model.js";
import ActiveBookingModel from "../../../../DB/models/activeBooking.model.js";
import InactiveBookingModel from "../../../../DB/models/inactiveBookingSchema.model.js";
import { sendEmail } from "../../../utils/SendEmail.js";
//عرض حميع المهنيين
export const getApprovedProfessionals = async (req, res, next) => {
  const professionals = await professionalModel.find({ isApproved: true })
    .select("username birthdate gender professionField email phoneNumber originalGovernorate anotheremail isApproved city confirmEmail description bio governorate")
    .populate("governorate", "name")
    .populate("originalGovernorate", "name")
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
    reviews.map(r => [r._id.toString(), Number(r.averageRating.toFixed(1))])
  );

  const result = professionals.map(p => ({
    _id: p._id,
    username: p.username,
    birthdate: p.birthdate,
    gender: p.gender,
    professionField: p.professionField,
    email: p.email,
    phoneNumber: p.phoneNumber,
    originalGovernorate: p.originalGovernorate?.name ?? "غير محددة",
    anotheremail: p.anotheremail,
    isApproved: p.isApproved,
    city: p.city,
    confirmEmail: p.confirmEmail,
    description: p.description,
    bio: p.bio,
    governorate: p.governorate?.name ?? "غير محددة",
    rating: ratingMap.get(p._id.toString()) ?? "لا يوجد تقييمات"
  }));

  res.status(200).json({
    message: "تم جلب بيانات المهنيين المقبولين بنجاح",
    total: result.length,
    professionals: result
  });
};
//عرض المهنيين قيد الانتظار
export const getUnapprovedProfessionals = async (req, res, next) => {
  const professionals = await professionalModel.find({ isApproved: false })
    .select("username birthdate gender professionField email phoneNumber originalGovernorate anotheremail isApproved city confirmEmail description bio governorate")
    .populate("governorate", "name")
    .populate("originalGovernorate", "name")
    .lean();

  const result = professionals.map(p => ({
    _id: p._id,
    username: p.username,
    birthdate: p.birthdate,
    gender: p.gender,
    professionField: p.professionField,
    email: p.email,
    phoneNumber: p.phoneNumber,
    originalGovernorate: p.originalGovernorate?.name ?? "غير محددة",
    anotheremail: p.anotheremail,
    isApproved: p.isApproved,
    city: p.city,
    confirmEmail: p.confirmEmail,
    description: p.description,
    bio: p.bio,
    governorate: p.governorate?.name ?? "غير محددة"
  }));

  res.status(200).json({
    message: "تم جلب بيانات المهنيين غير المقبولين بنجاح",
    total: result.length,
    professionals: result
  });
};
//قبول المهني
export const approveProfessional = async (req, res) => {
  const { id } = req.params;

    const updatedProfessional = await professionalModel.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true } // يرجع النسخة المحدثة من الوثيقة
    );

    if (!updatedProfessional) {
      return res.status(404).json({ message: "المهني غير موجود" });
    } 
    const subject = "تمت الموافقة على حسابك كمهني";
    const html = `
      <div style="font-family: Arial; direction: rtl; text-align: right;">
        <h2>مرحبًا ${updatedProfessional.username}،</h2>
        <p>نحيطك علمًا بأنه تمت الموافقة على حسابك في منصة <strong>أسأل مهني</strong>.</p>
        <p>يمكنك الآن تسجيل الدخول والتفاعل مع المستخدمين.</p>
        <p>مع تحيات فريق أسأل مهني.</p>
      </div>
    `;

    await sendEmail(updatedProfessional.email, subject, html);

    return res.status(200).json({
      message: "تمت الموافقة على المهني بنجاح",
      professional: updatedProfessional,
    });
   
    
};
//حذف المهني
export const deleteProfessional = async (req, res) => {
  const { professionalId } = req.params;
  const { deleteReason } = req.body;

    const professional = await professionalModel.findById(professionalId);

    if (!professional) {
      return res.status(404).json({ message: "المهني غير موجود" });
    }

    // تخزين بيانات المهني المحذوف
    await DeletedProfessionalModel.create({
      professionalId: professional._id,
      username: professional.username,
      email: professional.email,
      phoneNumber: professional.phoneNumber,
      birthdate: professional.birthdate,
      gender: professional.gender,
      professionField: professional.professionField,
      governorate: professional.governorate || null,
      originalGovernorate: professional.originalGovernorate || null,
      usertype: professional.usertype,
      password: professional.password,
      deleteReason,
    });

    // إعداد محتوى الإيميل
    const subject = "تم حذف حسابك";
    const html = `
      <div style="font-family: Arial; direction: rtl; text-align: right;">
        <h2>مرحباً ${professional.username}</h2>
        <p>نأسف لإبلاغك أنه تم حذف حسابك من منصة "أسأل مهني".</p>
        <p><strong>سبب الحذف:</strong> ${deleteReason}</p>
        <p>مع التحية،<br>فريق أسأل مهني</p>
      </div>
    `;

    // إرسال الإيميل بدون أي شرط
    await sendEmail(professional.email, subject, html);

    // حذف المهني من قاعدة البيانات
    await professionalModel.findByIdAndDelete(professionalId);

    return res.status(200).json({ message: "تم حذف المهني وتخزين معلوماته مع سبب الحذف بنجاح" });

 
};
//استرجاع المهني
export const restoreDeletedProfessional = async (req, res) => {
  const { deletedId } = req.params;
  const { restoreReason } = req.body;

  const deletedProfessional = await DeletedProfessionalModel.findById(deletedId);

  if (!deletedProfessional) {
    return res.status(404).json({ message: "المهني المحذوف غير موجود" });
  }

  const restoredProfessional = await professionalModel.create({
    _id: deletedProfessional.professionalId,
    username: deletedProfessional.username,
    email: deletedProfessional.email,
    phoneNumber: deletedProfessional.phoneNumber,
    birthdate: deletedProfessional.birthdate,
    gender: deletedProfessional.gender,
    professionField: deletedProfessional.professionField,
    governorate: deletedProfessional.governorate,
    originalGovernorate: deletedProfessional.originalGovernorate,
    usertype: deletedProfessional.usertype,
    confirmEmail: true,
    password: deletedProfessional.password,
    isApproved: true,
  });

  const subject = "تم استرجاع حسابك";
  const html = `
    <div style="font-family: Arial; direction: rtl; text-align: right;">
      <h2>مرحباً ${restoredProfessional.username}</h2>
      <p>يسعدنا إعلامك أنه تم استرجاع حسابك في منصة "أسأل مهني".</p>
      <p><strong>سبب الاسترجاع:</strong> ${restoreReason}</p>
      <p>مع التحية،<br>فريق أسأل مهني</p>
    </div>
  `;

  await sendEmail(restoredProfessional.email, subject, html);

  await DeletedProfessionalModel.findByIdAndDelete(deletedId);

  return res.status(200).json({
    message: "تم استرجاع المهني بنجاح وإرسال إيميل",
    professional: restoredProfessional,
  });
};
//عرض الاراء 
export const getAllReviews = async (req, res) => {
  const reviews = await ReviewModel.find()
    .populate({ path: "user", select: "username" })
    .populate({ path: "professional", select: "username" });

  const formattedReviews = reviews.map((review) => ({
    user: review.user?.username || "مستخدم غير معروف",
    professional: review.professional?.username || "مهني غير معروف",
    rating: review.rating,
    comment: review.comment,
    date: review.date,
  }));

  return res.status(200).json({ message: "success", reviews: formattedReviews });
};
//عرض المهنيين المحذوفين
export const getDeletedProfessionals = async (req, res, next) => {
  const deletedProfessionals = await DeletedProfessionalModel.find()
    .populate("governorate", "name")
    .populate("originalGovernorate", "name");

  res.status(200).json({
    message: "تم جلب المهنيين المحذوفين بنجاح",
    data: deletedProfessionals
  });
};
//الحجوزات
export const getBookingStatsByProfessionField = async (req, res, next) => {
  const { professionField, governorate } = req.query;

  // بناء شرط البحث بناءً على وجود القيم
  const filter = {};
  if (professionField) filter.professionField = professionField;
  if (governorate) filter.governorate = governorate;

  // جلب المهنيين مع اسم المحافظة
  const professionals = await professionalModel.find(filter)
    .select('username professionField governorate')
    .populate('governorate', 'name'); 

  if (professionals.length === 0) {
    return res.status(200).json({
      message: "لا يوجد مهنيين حسب الفلاتر المطلوبة",
      data: []
    });
  }

  const professionalIds = professionals.map(p => p._id);

  const activeBookings = await ActiveBookingModel.aggregate([
    {
      $match: {
        professionalId: { $in: professionalIds }
      }
    },
    {
      $group: {
        _id: "$professionalId",
        activeBookings: { $sum: 1 }
      }
    }
  ]);

  const inactiveBookings = await InactiveBookingModel.aggregate([
    {
      $match: {
        professionalId: { $in: professionalIds }
      }
    },
    {
      $group: {
        _id: "$professionalId",
        cancelledBookings: { $sum: 1 }
      }
    }
  ]);

  const statsMap = {};

  activeBookings.forEach(item => {
    statsMap[item._id.toString()] = {
      professionalId: item._id,
      activeBookings: item.activeBookings,
      cancelledBookings: 0
    };
  });

  inactiveBookings.forEach(item => {
    const idStr = item._id.toString();
    if (statsMap[idStr]) {
      statsMap[idStr].cancelledBookings = item.cancelledBookings;
    } else {
      statsMap[idStr] = {
        professionalId: item._id,
        activeBookings: 0,
        cancelledBookings: item.cancelledBookings
      };
    }
  });

  const result = professionals.map(prof => {
    const stats = statsMap[prof._id.toString()] || {
      activeBookings: 0,
      cancelledBookings: 0
    };

    return {
      professionalId: prof._id,
      professionalName: prof.username,
      professionField: prof.professionField,
      governorate: prof.governorate?.name || "غير محددة",
      totalBookings: stats.activeBookings + stats.cancelledBookings,
      activeBookings: stats.activeBookings,
      cancelledBookings: stats.cancelledBookings
    };
  });

  res.status(200).json({
    message: "تم جلب احصائيات الحجوزات بنجاح",
    data: result
  });
};
