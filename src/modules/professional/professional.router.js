import { Router } from 'express';
import * as controller from './professional.controller.js';
import { asyncHandler } from '../../utils/catchError.js';


const router = Router();

//عرض المهنيين
router.get('/getProfessionals',asyncHandler(controller.getProfessionals));
//تطبيق الفلتر 
router.get('/getProfessionalsByRating',asyncHandler(controller.getProfessionalsByRating));
//البحث
router.get('/searchProfessionalsByName',asyncHandler(controller.searchProfessionalsByName));



export default router;
