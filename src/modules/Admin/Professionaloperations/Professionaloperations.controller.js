import professionalModel from "../../../../DB/models/professional.model.js";
import ReviewModel from "../../../../DB/models/review.model.js";
import DeletedProfessionalModel from "../../../../DB/models/deletedProfessional.model.js";
import { sendEmail } from "../../../utils/SendEmail.js";
//عرض حميع المهنيين
export const getAllProfessionals = async (req, res, next) => {
 const professionals = await professionalModel.find({})
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
    message: "تم جلب جميع بيانات المهنيين بنجاح",
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

    return res.status(200).json({
      message: "تمت الموافقة على المهني بنجاح",
      professional: updatedProfessional,
    });
};
//حذف المهني
export const deleteProfessional = async (req, res) => {
  const { professionalId } = req.params;
  const { deleteReason } = req.body;

  try {
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

    // إرسال الإيميل
    if (professional.email && typeof professional.email === "string" && professional.email.includes("@")) {
      await sendEmail(professional.email, subject, html);
    } else {
      console.warn("⚠️ لا يمكن إرسال الإيميل. البريد الإلكتروني غير متوفر أو غير صالح:", professional.email);
    }

    // حذف المهني من قاعدة البيانات
    await professionalModel.findByIdAndDelete(professionalId);

    return res.status(200).json({ message: "تم حذف المهني وتخزين معلوماته مع سبب الحذف بنجاح" });

  } catch (err) {
    console.error("❌ خطأ أثناء الحذف:", err);
    return res.status(500).json({ message: "خطأ في الخادم", error: err.message });
  }
};
//استرجاع المهني
export const restoreDeletedProfessional = async (req, res) => {
  const { deletedId } = req.params;
  const { restoreReason } = req.body;

  try {
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
      password: deletedProfessional.password, // كلمة السر كما كانت
      isApproved: true,
    });

    // إعداد الإيميل
    const subject = "تم استرجاع حسابك";
    const html = `
      <div style="font-family: Arial; direction: rtl; text-align: right;">
        <h2>مرحباً ${restoredProfessional.username}</h2>
        <p>يسعدنا إعلامك أنه تم استرجاع حسابك في منصة "أسأل مهني".</p>
        <p><strong>سبب الاسترجاع:</strong> ${restoreReason}</p>
        <p>مع التحية،<br>فريق أسأل مهني</p>
      </div>
    `;

    // إرسال الإيميل إن وجد بريد صحيح
    if (
      restoredProfessional.email &&
      typeof restoredProfessional.email === "string" &&
      restoredProfessional.email.includes("@")
    ) {
      await sendEmail(restoredProfessional.email, subject, html);
    } else {
      console.warn("⚠️ لا يمكن إرسال الإيميل. البريد غير متوفر أو غير صالح:", restoredProfessional.email);
    }

    // حذف السجل من المحذوفين
    await DeletedProfessionalModel.findByIdAndDelete(deletedId);

    return res.status(200).json({
      message: "تم استرجاع المهني بنجاح وإرسال إيميل",
      professional: restoredProfessional,
    });

  } catch (err) {
    console.error("❌ خطأ أثناء استرجاع المهني:", err);
    return res.status(500).json({ message: "حدث خطأ في الخادم", error: err.message });
  }
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

