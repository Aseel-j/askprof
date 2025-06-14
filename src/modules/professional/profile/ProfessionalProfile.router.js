import { Router } from 'express';
import * as controller from './ProfessionalWork/ProfessionalWork.controller.js';
import * as controller1 from './ProfessionalWorkingHours/ProfessionalWorkingHours.controller.js';
import * as controller2 from './profInformation/profInformation.controller.js';
import * as controller3 from './ProfProfilepicture&Video/pictureAndVideo.controller.js';
import { asyncHandler } from '../../../utils/catchError.js';
import validation from '../../../middleware/validation.js';
import fileUpload, { fileValidation } from '../../../utils/multer.js';
import {  updateDescriptionSchema, updateProfessionalProfileSchema ,updateGovernorateSchema} from './profInformation/profInformation.validation.js';
import { editProfessionalWorkSchema,addProfessionalWorkSchema} from './ProfessionalWork/ProfessionalWork.validation.js';
import { addWorkingHoursSchema } from './ProfessionalWorkingHours/ProfessionalWorkingHours.validation.js';

const router = Router();
// تحميل الصورة الشخصية
router.put('/uploadProfilePicture/:id',fileUpload(fileValidation.image).single('image'),asyncHandler(controller3.uploadProfilePicture));
// تحميل الفيديو
router.put('/uploadVideo/:id',fileUpload(fileValidation.video).single('video'),asyncHandler(controller3.uploadVideo));
//عرض الصورة
router.get('/getProfilePicture/:id',asyncHandler(controller3.getProfilePicture));
//عرض الفيديو
router.get('/getVideo/:id',asyncHandler(controller3.getVideo));
//حذف الفيديو
router.delete('/deleteVideo/:id',asyncHandler(controller3.deleteVideo));
//تحديث بيانات الملف الشخصي 
router.put('/updateProfessionalProfile/:id',validation(updateProfessionalProfileSchema),asyncHandler(controller2.updateProfessionalProfile));
//تعديل محافظة المهني 
//router.put('/updateProfessionalGovernorate/:id',validation(updateGovernorateSchema),asyncHandler(controller2.updateProfessionalGovernorate));
//عرض بيانات الملف الشخصي 
router.get('/getProfessionalProfile/:id',asyncHandler(controller2.getProfessionalProfile));
//اضافة نبذة عن المهني
router.put('/updateProfessionalDescription/:id',validation(updateDescriptionSchema),asyncHandler(controller2.updateProfessionalDescription));
//عرض النبذة عن المهني
router.get('/getProfessionalDescription/:id',asyncHandler(controller2.getProfessionalDescription));
//اضافة عمل من اعمال المهني
router.post('/addProfessionalWork/:id',fileUpload(fileValidation.image).array('image'),validation(addProfessionalWorkSchema),asyncHandler(controller.addProfessionalWork));
//عرض الاعمال
router.get('/getProfessionalWorks/:id',asyncHandler(controller.getProfessionalWorks));
//تعديل على العمل
router.put('/editProfessionalWork/:id',fileUpload(fileValidation.image).array('image'),validation(editProfessionalWorkSchema),asyncHandler(controller.editProfessionalWork));
//حذف عمل 
router.delete('/deleteWork/:id',asyncHandler(controller.deleteWork));
//اضافة مواعيد 
router.post('/addWorkingHours/:id',validation(addWorkingHoursSchema),asyncHandler(controller1.addWorkingHours));
//عرض المواعيد
router.get('/getWorkingHours/:id',asyncHandler(controller1.getWorkingHoursByPeriods));
//حذف موعد
router.delete('/deleteWorkingHour/:id',asyncHandler(controller1.deleteWorkingHour));
export default router;
