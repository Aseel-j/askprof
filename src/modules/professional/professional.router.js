import { Router } from 'express';
import * as controller from './professional.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
import validation from '../../middleware/validation.js';
import { getProfessionalsByRatingSchema, getProfessionalsSchema, searchProfessionalsByNameSchema } from './professional.validation.js';


const router = Router();

//عرض المهنيين
router.get('/getProfessionals',validation(getProfessionalsSchema),asyncHandler(controller.getProfessionals));
//تطبيق الفلتر 
router.get('/getProfessionalsByRating',validation(getProfessionalsByRatingSchema),asyncHandler(controller.getProfessionalsByRating));
//البحث
router.get('/searchProfessionalsByName',validation(searchProfessionalsByNameSchema),asyncHandler(controller.searchProfessionalsByName));



export default router;
