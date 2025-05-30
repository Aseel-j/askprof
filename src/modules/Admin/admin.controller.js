import bcrypt from "bcrypt";
import AdminModel from "../../../DB/models/admin.model.js";
import jwt from 'jsonwebtoken';

//تسجيل الدخول 
export const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;

  // البحث عن الأدمن بالبريد الإلكتروني
  const admin = await AdminModel.findOne({ email });
  if (!admin) {
    return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
  }

  // التحقق من كلمة المرور
  const isMatch = bcrypt.compareSync(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ message: "خطأ في البريد الإلكتروني أو كلمة المرور" });
  }

  // توليد التوكن
  const token = jwt.sign(
    {
      id: admin._id,
      name: admin.name,
      role: "admin"
    },
    process.env.LOGIN_SIGNAL
  );

  return res.status(200).json({ message: "تم تسجيل الدخول بنجاح", token });
};

//node src/modules/Admin/admin.controller.js
