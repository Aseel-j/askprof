import { Schema,model,mongoose } from 'mongoose';

const activeBookingSchema = new Schema(
  {
    // تاريخ الحجز
    bookingDate: {
      type: Date,
      required: true,
    },
    //ساعة الحجز

      bookingTime: {
      type: String,
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

  },
  {
    timestamps: true, // سيضيف تاريخ الإنشاء والتحديث تلقائيًا
  }
);

const ActiveBookingModel = mongoose.models.ActiveBooking||model('ActiveBooking', activeBookingSchema);
export default ActiveBookingModel;
