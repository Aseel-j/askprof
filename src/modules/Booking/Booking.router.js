import { Router } from 'express';
import * as controller from './Booking.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
import validation from '../../middleware/validation.js';
import bookingSchema from './Booking.validation.js';


const router = Router();

//اضافة حجز 
router.post('/createBooking/:professionalId',validation(bookingSchema),asyncHandler(controller.createBooking));
//عرض الحجوزات
router.get('/getBookings',asyncHandler(controller.getBookings));
//الغاء الحجز 
router.delete('/cancelBooking/:bookingId', asyncHandler(controller.cancelBooking));
// عرض الحجوزات الملغية
router.get('/getDeletedBookings',asyncHandler(controller.getDeletedBookings));



export default router;
