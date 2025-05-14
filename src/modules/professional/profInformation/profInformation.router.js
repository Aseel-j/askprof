import { Router } from 'express';
import * as controller from './profInformation.controller.js';
import { asyncHandler } from '../../../utils/catchError.js';
import validation from '../../../middleware/validation.js';
import {  updateDescriptionSchema, updateProfessionalProfileSchema } from './profInformation.validation.js';

const router = Router();

//تحديث بيانات الملف الشخصي 
router.put('/updateProfessionalProfile/:id',validation(updateProfessionalProfileSchema),asyncHandler(controller.updateProfessionalProfile));
//عرض بيانات الملف الشخصي 
router.get('/getProfessionalProfile/:id',asyncHandler(controller.getProfessionalProfile));
//اضافة نبذة عن المهني
router.put('/updateProfessionalDescription/:id',validation(updateDescriptionSchema),asyncHandler(controller.updateProfessionalDescription));
//عرض النبذة عن المهني
router.get('/getProfessionalDescription/:id',asyncHandler(controller.getProfessionalDescription));
export default router;
