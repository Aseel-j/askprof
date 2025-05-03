import {Router} from 'express';
import * as controller from './auth.controller.js'
import validation from '../../middleware/validation.js';
import { loginSchema, registerSchema, resetPasswordSchema, SendCodeSchema } from './auth.validation.js';
import { asyncHandler } from '../../utils/catchError.js';
const router=Router();
//انشاء الحساب 
router.post('/register',validation(registerSchema),asyncHandler(controller.register));
// تاكيد الحساب 
router.get('/confirmEmail/:token',asyncHandler(controller.confirmEmail));
//تسجيل الدخول 
router.post('/login',validation(loginSchema),asyncHandler(controller.login));
//ارسال الكود 
router.post('/sendCode',validation(SendCodeSchema),asyncHandler(controller.SendCode));
//تغيير الكود 
router.post('/resetPassword',validation(resetPasswordSchema),asyncHandler(controller.resetPassword));
export default router;