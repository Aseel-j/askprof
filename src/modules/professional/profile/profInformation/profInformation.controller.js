import professionalModel from '../../../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import GovernorateModel from '../../../../../DB/models/governorate.model.js';

//تعديل بيانات البروفايل
export const updateProfessionalProfile = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const { username, bio, governorate, city, anotheremail, phoneNumber, professionField } = req.body;

  if (governorate) {
    const governoratename = await GovernorateModel.findOne({ name: governorate });
    if (!governoratename) {
      return res.status(404).json({ message: "المحافظة غير موجودة" });
    }
    professional.governorate = governoratename._id;
  }
  if (username) professional.username = username;
  if (anotheremail) professional.anotheremail = anotheremail;
  if (bio) professional.bio = bio;
  if (phoneNumber) professional.phone = phoneNumber;
  if (city) professional.city = city;
  if (professionField) professional.professionField = professionField; 

  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الملف الشخصي بنجاح",
    professional,
  });
};
/*export const updateProfessionalProfile = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const { username, bio, city, anotheremail, phoneNumber, professionField } = req.body;

  if (username) professional.username = username;
  if (anotheremail) professional.anotheremail = anotheremail;
  if (bio) professional.bio = bio;
  if (phoneNumber) professional.phone = phoneNumber;
  if (city) professional.city = city;
  if (professionField) professional.professionField = professionField;

  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الملف الشخصي بنجاح",
    professional,
  });
};*/
//تعديل المحافظة 
/*export const updateProfessionalGovernorate = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;
  const { governorate } = req.body;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const governorateData = await GovernorateModel.findOne({ name: governorate });
  if (!governorateData) {
    return res.status(404).json({ message: "المحافظة غير موجودة" });
  }

  professional.governorate = governorateData._id;
  await professional.save();

  return res.status(200).json({
    message: "تم تحديث المحافظة بنجاح",
    professional,
  });
};*/
//عرض بيانات الملف الشخص
export const getProfessionalProfile = async (req, res) => {
  const { id } = req.params; // الحصول على ID المهني من الـ params

  const professional = await professionalModel
    .findById(id)
    .populate("governorate", "name"); // إحضار اسم المحافظة فقط

  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const profileObj = professional.toObject();
  const filteredProfile = {};

  // city مع تعويضها باسم المحافظة إذا كانت فارغة
  if (profileObj.city && profileObj.city.trim() !== "") {
    filteredProfile.city = profileObj.city;
  } else if (profileObj.governorate && profileObj.governorate.name) {
    filteredProfile.city = profileObj.governorate.name;
  }

  // الحقول التي تريدها بما في ذلك profilePicture بنفس الطريقة
  const otherFields = [
    "username",
    "bio",
    "phoneNumber",
    "anotheremail",
    "professionField",
    "profilePicture", // أضف profilePicture هنا لتُرجعها مع باقي الحقول
  ];

  for (const field of otherFields) {
    const value = profileObj[field];
    if (value !== null && value !== undefined) {
      filteredProfile[field] = value;
    }
  }

  // إرجاع الـ id
  filteredProfile.id = profileObj._id;

  return res.status(200).json(filteredProfile);
};
// اضافة شرح عن المهني
 export const updateProfessionalDescription = async (req, res) => {
  const { token } = req.headers;
  const { id } = req.params;

  if (!token) {
    return res.status(401).json({ message: "التوكن مفقود" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  } catch (err) {
    return res.status(401).json({ message: "توكن غير صالح" });
  }

  if (decoded.id !== id) {
    return res.status(403).json({ message: "غير مصرح لك بتنفيذ هذا الإجراء" });
  }

  const professional = await professionalModel.findById(id);
  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  const { description } = req.body;
  if (!description || description.trim() === "") {
    return res.status(400).json({ message: "الوصف مطلوب" });
  }

  professional.description = description;
  await professional.save();

  return res.status(200).json({
    message: "تم تحديث الوصف بنجاح",
    description: professional.description,
  });
};
//عرض نبذة عن المهني
 export const getProfessionalDescription = async (req, res) => {
  const { id } = req.params;

  const professional = await professionalModel.findById(id);

  if (!professional) {
    return res.status(404).json({ message: "المهني غير موجود" });
  }

  return res.status(200).json({
    description: professional.description || null,
  });
};