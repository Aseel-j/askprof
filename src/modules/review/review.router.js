import {Router} from 'express';
import * as controller from './review.controller.js'
import validation from '../../middleware/validation.js';
import { addReviewSchema } from './review.validation.js';
import { asyncHandler } from '../../utils/catchError.js';
const router=Router();
//اضافة راي
router.post('/addReview/:professionalId',validation(addReviewSchema),asyncHandler(controller.addReview));
// تاكيد الحساب 
router.get('/getReviews/:professionalId',asyncHandler(controller.getProfessionalReviews));

export default router; 