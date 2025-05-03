import {Router} from 'express';
import * as controller from './review.controller.js'
import validation from '../../middleware/validation.js';
import { } from './review.validation.js';
import { asyncHandler } from '../../utils/catchError.js';
const router=Router();
//اضافة راي
router.post('/addReview',validation(registerSchema),asyncHandler(controller.addReview));
// تاكيد الحساب 
router.get('/confirmEmail/:token',asyncHandler(controller.confirmEmail));

export default router;