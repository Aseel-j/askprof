/*import { Router } from 'express';
import * as controller from './pictureAndVideo.controller.js';
import { asyncHandler } from '../../../utils/catchError.js';
import fileUpload, { fileValidation } from '../../../utils/multer.js';


const router = Router();

// تحميل الصورة الشخصية
router.put('/uploadProfilePicture/:id',fileUpload(fileValidation.image).single('image'),asyncHandler(controller.uploadProfilePicture));
// تحميل الفيديو
router.put('/uploadVideo/:id',fileUpload(fileValidation.video).single('video'),asyncHandler(controller.uploadVideo));
//عرض الصورة
//router.get('/getProfilePicture/:id',asyncHandler(controller.getProfilePicture));
//عرض الفيديو
//router.get('/getVideo/:id',asyncHandler(controller.getVideo));
export default router;*/
