import { Schema, model, mongoose } from "mongoose";
const workingHoursSchema = new Schema({
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
  },
  date: {
    type: Date,
    required: true
  },
    startTime: {
      type: String, 
      required: true,
    },
    endTime: {
      type: String, 
      required: true,
    },
  status: {
    type: String,
    enum: ["متاح", "محجوز"],
    default: "متاح"
  }
}, {
  timestamps: true,
});
const workingHoursModel = mongoose.models.WorkingHours || model('WorkingHours', workingHoursSchema);
export default workingHoursModel;
