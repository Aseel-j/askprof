import { Router } from 'express';
import * as controller from './professional.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
import fileUpload, { fileValidation } from '../../utils/multer.js';

const router = Router();

// تحميل الصورة الشخصية
router.put('/uploadProfilePicture',fileUpload(fileValidation.image).single('image'),asyncHandler(controller.uploadProfilePicture));
// تحميل الفيديو
router.put('/uploadVideo',fileUpload(fileValidation.video).single('video'),asyncHandler(controller.uploadVideo));
//عرض الصورة
router.get('/getProfilePicture',asyncHandler(controller.getProfilePicture));
//عرض الفيديو
router.get('/getVideo',asyncHandler(controller.getVideo));
//تحديث بيانات الملف الشخصي 
router.put('/updateProfessionalProfile',asyncHandler(controller.updateProfessionalProfile));
//عرض بيانات الملف الشخصي 
router.get('/getProfessionalProfile',asyncHandler(controller.getProfessionalProfile));
//اضافة نبذة عن المهني
router.put('/updateProfessionalDescription',asyncHandler(controller.updateProfessionalDescription));
//عرض النبذة عن المهني
router.get('/getProfessionalDescription',asyncHandler(controller.getProfessionalDescription));



export default router;
