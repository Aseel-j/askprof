import professionalModel from '../../../DB/models/professional.model.js';
import jwt from "jsonwebtoken";
import { AppError } from '../../utils/App.Error.js';
import cloudinary from '../../utils/cloudinary.js';
import GovernorateModel from '../../../DB/models/governorate.model.js';


export const uploadProfilePicture = async (req, res, next) => {
  
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

    // التحقق من وجود المهني في قاعدة البيانات
    const professional = await professionalModel.findById(decoded.id);
    if (!professional) {
      return next(new AppError("User not found", 404));
    }

    // التأكد من أن الملف المرفق هو صورة
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }

    // في حالة وجود صورة بروفايل سابقة على Cloudinary، نقوم بحذفها
    if (professional.profilePicture) {
      const publicId = professional.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // تحميل الصورة الجديدة إلى Cloudinary
    const { secure_url } = await cloudinary.uploader.upload(req.file.path);

    // تحديث صورة البروفايل في قاعدة البيانات
    professional.profilePicture = secure_url;
    await professional.save();

    return res.status(200).json({ message: "Profile picture updated", imageUrl: secure_url }); 
};

//تحميل الفيديو 
export const uploadVideo = async (req, res, next) => {
      const { token } = req.headers;
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

      const professional = await professionalModel.findById(decoded.id);
      if (!professional) {
        return next(new AppError("User not found", 404));
      }
  
      if (!req.file || !req.file.mimetype.startsWith('video/')) {
        return res.status(400).json({ message: "Only video files are allowed" });
      }
  
      // حذف الفيديو السابق إن وُجد
      if (professional.video) {
        const publicId = professional.video.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      }
  
      // رفع الفيديو الجديد
      const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'video'
      });
  
      // تحديث الفيديو في قاعدة البيانات فقط
      professional.video = secure_url;
      await professional.save();
  
      return res.status(200).json({ message: "Video updated", videoUrl: secure_url });
  };
  //ارجاع الصورة
  export const getProfilePicture = async (req, res, next) => {
    const { token } = req.headers;
   
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
      const professional = await professionalModel.findById(decoded.id);
  
      if (!professional) {
        return next(new AppError("User not found", 404));
      }
  
      return res.status(200).json({
        message: "Profile picture fetched successfully",
        imageUrl: professional.profilePicture || null
      });
   
  };
  //ارجاع الفيديو 
  export const getVideo = async (req, res, next) => {
    const { token } = req.headers;
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
      const professional = await professionalModel.findById(decoded.id);
  
      if (!professional) {
        return next(new AppError("User not found", 404));
      }
  
      return res.status(200).json({
        message: "Video fetched successfully",
        videoUrl: professional.video || null
      });
   
  };
 //تعديل بيانات البروفايل
 export const updateProfessionalProfile = async (req, res, next) => {
    const { token } = req.headers;
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
      const professional = await professionalModel.findById(decoded.id);
  
      if (!professional) {
        return next(new AppError("المهني غير موجود ", 404));
      }
      // تحديث الحقول إذا تم إرسالها فقط
      const {username,fullname,bio,governorate,city,anotheremail,phoneNumber} = req.body;
     
      const governoratename = await GovernorateModel.findOne({ name: governorate });
  
      if (!governoratename) {
        return next(new AppError("المحافظة غير موجودة", 404));
      }
  
      if (username) professional.username = username;
      if (fullname) professional.fullname = fullname;
      if (governorate) professional.governorate = governoratename._id;
      if (anotheremail) professional.anotheremail = anotheremail;
      if (bio) professional.bio = bio;
      if (phoneNumber) professional.phone = phone;
      if (city) professional.city = city;
  
      await professional.save();
  
      return res.status(200).json({
        message: "Profile updated successfully",
        professional,
      });
  
   
  };
  //عرض بيانات الملف الشخص
  export const getProfessionalProfile = async (req, res, next) => {
    const { token } = req.headers;
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

    const professional = await professionalModel
      .findById(decoded.id)
      .populate("governorate", "name"); // إحضار اسم المحافظة فقط

    if (!professional) {
      return res.status(404).json({ message: "المهني غير موجود"});
    }

    // الحقول التي نريد عرضها فقط
    const allowedFields = [
      "username",
      "fullname",
      "city",
      "governorate",
      "bio",
      "phoneNumber",
      "anotheremail"
    ];

    const profileObj = professional.toObject(); // نحوله لكائن عادي
    const filteredProfile = {};

    for (const field of allowedFields) {
      const value = profileObj[field];
      if (value !== null && value !== undefined) {
        filteredProfile[field] =
          field === "governorate" && typeof value === "object"
            ? value.name
            : value;
      }
    }

    return res.status(200).json(filteredProfile);
  };
  // اضافة شرح عن المهني
  export const updateProfessionalDescription = async (req, res, next) => {
   
      const { token } = req.headers;
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  
      const professional = await professionalModel.findById(decoded.id);
      if (!professional) {
        return res.status(404).json({ message: "المهني غير موجود" });
      }
  
      const { description } = req.body;
  
      professional.description = description;
      await professional.save();
  
      return res.status(200).json({
        message: "تمت العملية ينجاح",
        description: professional.description,
      });
    
  };
  //عرض نبذة عن المهني
  export const getProfessionalDescription = async (req, res, next) => {
      const { token } = req.headers;
      const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
  
      const professional = await professionalModel.findById(decoded.id);
  
      if (!professional) {
        return res.status(404).json({ message: "المهني غير موجود" });
      }
  
      return res.status(200).json({
        description: professional.description || null,
      });
   
  };
  
  
  
  
