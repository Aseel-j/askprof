import { Schema, model,mongoose } from 'mongoose';

const inactiveBookingSchema = new Schema(
  {
    // تاريخ الحجز
    bookingDate: {
      type: Date,
      required: true,
    },

    // المفتاح الأساسي للمهني (الذي يشير إلى المهني الذي تم الحجز لديه)
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional', // يشير إلى نموذج "المهني" في قاعدة البيانات
      required: true,
    },

    // المفتاح الأساسي للمستخدم (الذي يشير إلى المستخدم الذي قام بالحجز)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // يشير إلى نموذج "المستخدم" في قاعدة البيانات
      required: true,
    },

    // تفاصيل الحجز
    bookingDetails: {
      type: String, // تفاصيل الحجز مثل نوع الخدمة، المدة، الملاحظات
      required: true,
    },

    // سبب إلغاء الحجز (يتم تحديده في حالة كون الحجز ملغي)
    cancellationReason: {
      type: String, // النص الذي يوضح سبب الحذف أو الإلغاء
      default: null,
    },

  },
  {
    timestamps: true, // سيضيف تاريخ الإنشاء والتحديث تلقائيًا
  }
);

const InactiveBookingModel = mongoose.models.InactiveBooking ||model('InactiveBooking', inactiveBookingSchema);
export default InactiveBookingModel;
