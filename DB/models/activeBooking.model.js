import { Schema,model,mongoose } from 'mongoose';

const activeBookingSchema = new Schema(
  {
    bookingDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, 
      required: true,
    },
    endTime: {
      type: String, 
      required: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional', 
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    bookingDetails: {
      type: String, 
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);
const ActiveBookingModel = mongoose.models.ActiveBooking||model('ActiveBooking', activeBookingSchema);
export default ActiveBookingModel;
