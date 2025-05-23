import { Router } from 'express';
import * as controller from './Booking.controller.js';
import { asyncHandler } from '../../utils/catchError.js';


const router = Router();

//اضافة حجز 
router.post('/createBooking/:professionalId',asyncHandler(controller.createBooking));
//عرض الحجوزات
router.get('/getBookings',asyncHandler(controller.getBookings));
//الغاء الحجز 
router.delete('/cancelBooking/:bookingId', asyncHandler(controller.cancelBooking));
// عرض الحجوزات الملغية
router.get('/getDeletedBookings',asyncHandler(controller.getDeletedBookings));



export default router;
