import professionalModel from '../../../DB/models/professional.model.js';
import userModel from '../../../DB/models/user.model.js';
import governorateModel from '../../../DB/models/governorate.model.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  try {
    const { username, email, phoneNumber, password, birthdate, gender, role, governorate } = req.body;

    if (!["user", "professional"].includes(role)) {
      return res.status(400).json({ message: "نوع المستخدم غير صالح" });
    }

    // تحقق إذا كان الإيميل موجودًا مسبقًا
    const existingUser = await userModel.findOne({ email });
    const existingProfessional = await professionalModel.findOne({ email });
    if (existingUser || existingProfessional) {
      return res.status(409).json({ message: "البريد الإلكتروني مستخدم مسبقًا" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // تحقق من وجود المحافظة في سكيما المحافظات
    let governorateExists = null;
    if (role === "professional" && governorate) {
      governorateExists = await governorateModel.findOne({ name: governorate });
      if (!governorateExists) {
        return res.status(400).json({ message: "المحافظة غير موجودة" });
      }
    }

    // إذا كان المستخدم مهنيًا، أضف المحافظة في بياناته
    if (role === "professional") {
      const newProfessional = new professionalModel({
        username,
        email,
        phoneNumber,
        password: hashedPassword,
        birthdate,
        gender,
        role,
        governorate: governorateExists ? governorateExists : null, // تخزين الكائن الكامل للمحافظة
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
        role,
        // لا حاجة لحفظ المحافظة هنا للمستخدم العادي
      });

      await newUser.save();
      return res.status(201).json({ message: "تم إنشاء حساب المستخدم بنجاح" });
    }
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ أثناء التسجيل", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // البحث عن المستخدم أو المهني
    let user = await userModel.findOne({ email });
    let role = "user";

    if (!user) {
      user = await professionalModel.findOne({ email });
      role = "professional";
    }

    if (!user) {
      return res.status(404).json({ message: "البريد الإلكتروني غير صحيح" });
    }

    const check = bcrypt.compareSync(password, user.password);
    if (!check) {
      return res.status(400).json({ message: "كلمة المرور غير صحيحة" });
    }

    if (role === "professional" && !user.isApproved) {
      return res.status(403).json({ message: "لم تتم الموافقة على حسابك بعد" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.username, role: user.role },
      process.env.JWT_SECRET || "aseel",
      { expiresIn: "7d" }
    );

    return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
  } catch (error) {
    return res.status(500).json({ message: "حدث خطأ ما", error: error.message });
  }
};