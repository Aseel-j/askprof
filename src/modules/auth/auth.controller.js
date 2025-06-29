import professionalModel from '../../../DB/models/professional.model.js';
import userModel from '../../../DB/models/user.model.js';
import governorateModel from '../../../DB/models/governorate.model.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { customAlphabet  } from 'nanoid'
import { sendEmail } from '../../utils/SendEmail.js';

//انشاء الحساب
export const register = async (req, res, next) => {
  const {
    username,
    email,
    phoneNumber,
    password,
    birthdate,
    gender,
    usertype,
    originalGovernorate, 
    professionField 
  } = req.body;
  if (!["مستخدم", "مهني"].includes(usertype)) {
    return res.status(400).json({ message: "نوع المستخدم غير صالح" });
  }
  const existingUser = await userModel.findOne({ email });
  const existingProfessional = await professionalModel.findOne({ email });

  if (existingUser || existingProfessional) {
    return res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقًا" });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));

  let governorateId = null;
  if (usertype === "مهني" && originalGovernorate) {
    const governorateExists = await governorateModel.findOne({ name: originalGovernorate });
    if (!governorateExists) {
      return res.status(400).json({ message: "المحافظة غير موجودة" });
    }
    governorateId = governorateExists._id;
  }

  const token = jwt.sign({ email }, process.env.CONFIRM_EMAIL_SIGNAL);
  const html = `
    <div>
      <h1>مرحبا ${username}</h1>
      <h2>انقر هنا لتاكيد الحساب</h2>
      <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">confirm your email</a>
    </div>`;

  if (usertype === "مهني") {
    if (!professionField) {
      return res.status(400).json({ message: "يرجى إدخال مجال المهني" });
    }
    const newProfessional = new professionalModel({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      birthdate,
      gender,
      usertype,
      originalGovernorate: governorateId, 
      professionField,
      isApproved: false,
      confirmEmail: false
    });

    await newProfessional.save();
    await sendEmail(email, "تأكيد الحساب", html);
    return res.status(201).json({ message: "تم انشاء الحساب المهني بنجاح، بانتظار موافقة الأدمن" });

  } else {
    const newUser = new userModel({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      birthdate,
      gender,
      usertype,
      confirmEmail: false
    });

    await newUser.save();
    await sendEmail(email, "تأكيد الحساب", html);
    return res.status(201).json({ message: "تم إنشاء حساب المستخدم بنجاح" });
  }
};
//تاكيد الحساب 
export const confirmEmail = async (req, res) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.CONFIRM_EMAIL_SIGNAL);
  
  const user = await userModel.findOneAndUpdate({ email: decoded.email }, { confirmEmail: true });
  const professional = await professionalModel.findOneAndUpdate({ email: decoded.email }, { confirmEmail: true });

  if (user || professional) {
    return res.status(200).json({ message: "success" });
  }

  return res.status(404).json({ message: "الحساب غير موجود" });
};
//تسجيل الدخول 
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // نبحث في جدول المستخدمين
  const user = await userModel.findOne({ email });
  if (user) {
    if (!user.confirmEmail) {
      return res.status(403).json({ message: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول" });
    }

    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.username, usertype: "مستخدم" },
      process.env.LOGIN_SIGNAL
    );

    return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
  }

  // نبحث في جدول المهنيين
  const professional = await professionalModel.findOne({ email });
  if (professional) {
    if (!professional.confirmEmail) {
      return res.status(403).json({ message: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول" });
    }

    if (!professional.isApproved) {
      return res.status(403).json({ message: "لم تتم الموافقة على حسابك بعد" });
    }

    const check = bcrypt.compareSync(password, professional.password);
    if (!check) {
      return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
    }

    const token = jwt.sign(
      { id: professional._id, name: professional.username, usertype: "مهني" },
      process.env.LOGIN_SIGNAL
    );

    return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
  }

  // إذا لم يتم العثور على المستخدم أو المهني
  return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
};
//ارسال رمز تحقق
export const SendCode = async (req, res, next) => {
  const { email } = req.body;
   const code = customAlphabet('1234567890abcdefABCDEF', 6)();
const expireTime = new Date(Date.now() + 5 * 60 * 1000); // بعد 5 دقائق

  // البحث عن المستخدم أو المهني أو الأدمن
  let user = await userModel.findOne({ email });

  if (!user) {
    user = await professionalModel.findOne({ email });
  }

  if (!user) {
    return res.status(404).json({ message: "البريد الإلكتروني غير مسجل" });
  }

  // حفظ الكود وصلاحية الكود
  user.sendCode = code;
  user.codeExpire = expireTime;
  await user.save();

  // إرسال الكود بالبريد الإلكتروني
  const html = `<h2>رمز التحقق هو: ${code}</h2><p>صالح لمدة 10 دقائق فقط.</p>`;
  await sendEmail(email, 'تغيير كلمة المرور', html);

  return res.status(200).json({ message: "تم إرسال رمز التحقق إلى بريدك الإلكتروني" });
};
//تغيير كلمة المرور
export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) user = await professionalModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "البريد الإلكتروني غير صحيح" });
  }

  if (!user.sendCode || user.sendCode !== code) {
    return res.status(400).json({ message: "رمز التحقق غير صحيح" });
  }

  if (!user.codeExpire || user.codeExpire < new Date()) {
     user.sendCode = null;
     user.codeExpire = null;
      await user.save();
    return res.status(400).json({ message: "انتهت صلاحية رمز التحقق" });
  }

  const hashedPassword = await bcrypt.hash(password, parseInt(process.env.SALT_ROUND));
  user.password = hashedPassword;
  user.sendCode = null;
  user.codeExpire = null;
  await user.save();

  return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
};

