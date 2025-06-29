import { Schema, model,mongoose } from 'mongoose';
const inactiveBookingSchema = new Schema(
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
    cancellationReason: {
      type: String, 
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);
const InactiveBookingModel = mongoose.models.InactiveBooking ||model('InactiveBooking', inactiveBookingSchema);
export default InactiveBookingModel;
