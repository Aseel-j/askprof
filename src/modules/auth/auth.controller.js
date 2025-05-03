import professionalModel from '../../../DB/models/professional.model.js';
import userModel from '../../../DB/models/user.model.js';
import governorateModel from '../../../DB/models/governorate.model.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { customAlphabet  } from 'nanoid'
import { sendEmail } from '../../utils/SendEmail.js';
import { AppError } from '../../utils/App.Error.js';

//انشاء الحساب
export const register = async (req, res, next) => {
   const { username, email, phoneNumber, password, birthdate, gender, usertype, governorate } = req.body;

    if (!["مستخدم", "مهني"].includes(usertype)) {
      return next(new AppError("نوع المستخدم غير صالح"  , 400));
    }

    // تحقق إذا كان الإيميل موجودًا مسبقًا
    const existingUser = await userModel.findOne({ email });
    const existingProfessional = await professionalModel.findOne({ email });
    if (existingUser || existingProfessional) {
      return next(new AppError("البريد الإلكتروني مستخدم مسبقًا" , 409));
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password,parseInt(process.env.SALT_ROUND));
   

    // تحقق من وجود المحافظة في سكيما المحافظات
    let governorateId = null;
    if (usertype === "مهني" && governorate) {
      const governorateExists = await governorateModel.findOne({ name: governorate });
      if (!governorateExists) {
        return next(new AppError("المحافظة غير موجودة"  , 400));
      }
      governorateId = governorateExists._id; // 🟢 حفظ ID المحافظة
    }
    

    // إذا كان المستخدم مهنيًا، أضف المحافظة في بياناته
    if (usertype === "مهني") {
      const newProfessional = new professionalModel({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        birthdate,
        gender,
        usertype,
        governorate: governorateId, // استخدم الـ ID هنا
        isApproved: false,
      });

      await newProfessional.save();
      return res.status(201).json({ message: "تم تسجيل الحساب المهني بنجاح، بانتظار موافقة الأدمن" });

    } else {
      const newUser = new userModel({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        birthdate,
        gender,
        usertype,
      });

      await newUser.save();
      //انشاء التوكن
      const token = jwt.sign({email},process.env.CONFIRM_EMAIL_SIGNAL);
      const html =` 
      <div>
      <h1>مرحبا ${username}<h1/>
      <h2>تاكيد الحساب<h2/>
      <a href="${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}">confirm your email<a/>
      <div/>`;
      await sendEmail(email,"تاكيد الحساب",html); 
      return res.status(201).json({ message: "تم إنشاء حساب المستخدم بنجاح" });

    }
  };

  //تاكيد الحساب 
  export const confirmEmail= async (req,res)=>{
    const {token}=req.params;
    const decoded = jwt.verify(token,process.env.CONFIRM_EMAIL_SIGNAL);
    const user = await userModel.findOneAndUpdate({email:decoded.email},{confirmEmail:true});
    return res.status(200).json({message:"success"});
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
      return next(new AppError("البريد الإلكتروني غير صحيح" , 404));
    }

    if (!user.confirmEmail) {
      return next(new AppError("يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول" , 403));
    }

    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return next(new AppError("كلمة المرور غير صحيحة" , 400));
    }

    if (usertype === "مهني" && !user.isApproved) {
      return next(new AppError("لم تتم الموافقة على حسابك بعد ", 403));
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
      return next(new AppError("البريد الإلكتروني غير مسجل", 404));
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
       return next(new AppError("البريد الإلكتروني غير صحيح", 400));
     }
   }
  if(user.sendCode != code){
    return next (new AppError ( "رمز التحقق غير صحيح",400));
  }
  const hashedpassword= await bcrypt.hash(password,parseInt(process.env.SALT_ROUND));
  user.password=hashedpassword;
  user.sendCode=null;
  await user.save();
  return res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
} 