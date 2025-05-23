import professionalModel from '../../../DB/models/professional.model.js';
import userModel from '../../../DB/models/user.model.js';
import governorateModel from '../../../DB/models/governorate.model.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { customAlphabet  } from 'nanoid'
import { sendEmail } from '../../utils/SendEmail.js';

//انشاء الحساب
/*export const register = async (req, res, next) => {
  const {
    username,
    email,
    phoneNumber,
    password,
    birthdate,
    gender,
    usertype,
    governorate,
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
  if (usertype === "مهني" && governorate) {
    const governorateExists = await governorateModel.findOne({ name: governorate });
    if (!governorateExists) {
      return res.status(400).json({ message: "المحافظة غير موجودة" });
    }
    governorateId = governorateExists._id;
  }

  const token = jwt.sign({ email }, process.env.CONFIRM_EMAIL_SIGNAL);
  const html = `
    <div>
      <h1>مرحبا ${username}</h1>
      <h2>تأكيد الحساب</h2>
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
      governorate: governorateId,
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
};*/
// إنشاء الحساب
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
      <h2>تأكيد الحساب</h2>
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
export const login = async (req, res,next) => {
   const { email, password } = req.body;

    // البحث عن المستخدم أو المهني
    let user = await userModel.findOne({ email });
    let usertype = "مستخدم";

    if (!user) {
      user = await professionalModel.findOne({ email });
      usertype = "مهني";
    }
    
    if (!user) {
     return res.status(400).json({ message: "خطا في البريد الإلكتروني او كلمة المرور " });

      //return next(new AppError("البريد الإلكتروني غير صحيح" , 404));
    }

  
    if (!user.confirmEmail) {
      return res.status(403).json({ message: "يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول" });

     // return next(new AppError("يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول" , 403));
    }
    const check = bcrypt.compareSync(password, user.password);
   if (!check) {
     return res.status(400).json({ message: "خطا في البريد الإلكتروني او كلمة المرور " });

     // return next(new AppError("كلمة المرور غير صحيحة" , 400));
    }

    if (usertype === "مهني" && !user.isApproved) {
      return res.status(403).json({ message: "لم تتم الموافقة على حسابك بعد " });

      //return next(new AppError("لم تتم الموافقة على حسابك بعد ", 403));
    }

    const token = jwt.sign({ id: user._id, name: user.username, usertype: user.usertype },process.env.LOGIN_SIGNAL);

    return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
};

//ارسال رمز تحقق
export const SendCode = async(req,res,next)=>{
  const {email}= req.body;
  const code = customAlphabet('1234567890abcdefABCDEF', 4)();
  let user = await userModel.findOne({ email });

  if (user) {
    user.sendCode = code;
    await user.save();
  } else {
    // إذا لم يوجد، ابحث في المهنيين
    user = await professionalModel.findOne({ email });
    if (!user) {
     return res.status(404).json({ message: "البريد الإلكتروني غير مسجل " });

     // return next(new AppError("البريد الإلكتروني غير مسجل", 404));
    }
    user.sendCode = code;
    await user.save();
  }
   const html= `<h2>code is ${code}<h2/>`;
   await sendEmail(email,'تغيير كلمة المرور',html);
   return res.status(200).json({message:"success"});

};

//تغيير كلمة المرور
export const resetPassword= async(req,res,next)=>{
  const {code,email,password}=req.body;
   // ابحث أولاً في المستخدمين
   let user = await userModel.findOne({ email });

   if (!user) {
     // إذا لم يوجد، ابحث في المهنيين
     user = await professionalModel.findOne({ email });
     if (!user) {
      return res.status(400).json({ message: "البريد الإلكتروني غير صحيح " });

       //return next(new AppError("البريد الإلكتروني غير صحيح", 400));
     }
   }
  if(user.sendCode != code){
   return res.status(400).json({ message: "رمز التحقق غير صحيح " });

   // return next (new AppError ( "رمز التحقق غير صحيح",400));
  }
  const hashedpassword= await bcrypt.hash(password,parseInt(process.env.SALT_ROUND));
  user.password=hashedpassword;
  user.sendCode=null;
  await user.save();
  return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
} 