import { Router } from 'express';
import * as controller from './Professionaloperations/Professionaloperations.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
import auth from '../../middleware/admin.js';
import * as controller2 from '../governorate/governorate.controller.js'
import validation from '../../middleware/validation.js';
import { loginSchema } from './admin.validation.js';
import * as controller1 from './admin.controller.js';
import { SendCodeSchema,resetPasswordSchema } from '../auth/auth.validation.js';
const router = Router();
//تسجيل الدخول 
router.post('/loginAdmin',validation(loginSchema),asyncHandler(controller1.loginAdmin));
// عرض المهنيين المهنيين المقبولين
router.get('/getApprovedProfessionals',asyncHandler(auth()),asyncHandler(controller.getApprovedProfessionals));
//عرض المهنيين قيد الانتظار
router.get('/getUnapprovedProfessionals',asyncHandler(auth()),asyncHandler(controller.getUnapprovedProfessionals));
//عرض المهنيين المحذوفين
router.get('/getDeletedProfessionals',asyncHandler(auth()),asyncHandler(controller.getDeletedProfessionals));
//قبول المهني
router.put('/approveProfessional/:id',asyncHandler(auth()),asyncHandler(controller.approveProfessional));
//الغاء الحجز 
router.post('/deleteProfessional/:professionalId',asyncHandler(auth()),asyncHandler(controller.deleteProfessional));
//استرجاع المهني
router.post('/restoreDeletedProfessional/:deletedId',asyncHandler(auth()),asyncHandler(controller.restoreDeletedProfessional));
//عرض الاراء 
router.get('/getAllReviews',asyncHandler(auth()),asyncHandler(controller.getAllReviews));
//عرض المحافظات
router.get('/getGovernorate',asyncHandler(auth()),asyncHandler(controller2.getGovernorates));
//اضافة محافظة
router.post('/addGovernorate',asyncHandler(auth()),asyncHandler(controller2.addGovernorate));
//حذف المحافظة 
router.delete('/deleteGovernorate/:id',asyncHandler(auth()),asyncHandler(controller2.deleteGovernorate));
//ارسال الكود 
router.post('/sendCode',validation(SendCodeSchema),asyncHandler(controller1.SendCode));
//تغيير كلمة المرور 
router.post('/resetPassword',validation(resetPasswordSchema),asyncHandler(controller1.resetPassword));
//عرض معدل التقييمات وعددهن للموقع
router.get('/getAvgReviewStats',asyncHandler(auth()),asyncHandler(controller1.getAvgReviewStats));
//الحجوزات
router.get('/getBookingStatsByProfessionField',asyncHandler(auth()),asyncHandler(controller.getBookingStatsByProfessionField));

export default router;
