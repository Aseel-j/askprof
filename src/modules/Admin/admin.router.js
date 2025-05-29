import { Router } from 'express';
import * as controller from '../admin/Professionaloperations/Professionaloperations.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
//import validation from '../../middleware/validation.js';
//import bookingSchema from './Booking.validation.js';
import auth from '../../middleware/admin.js';
import * as controller2 from '../governorate/governorate.controller.js'


const router = Router();

//عرض المهنيين
router.get('/getAllProfessionals',asyncHandler(auth()),asyncHandler(controller.getAllProfessionals));
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



export default router;
