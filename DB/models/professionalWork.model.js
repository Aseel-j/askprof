import { Schema,model ,mongoose} from "mongoose";

const professionalWorkSchema = new mongoose.Schema({
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  placeWorkName: {
    type: String,
    required: false // مثلاً اسم الشركة أو المؤسسة (اختياري حسب الحالة)
  },
  summaryAboutWork: {
    type: String,
    required: true // نبذة قصيرة
  },
  description: {
    type: String,
    required: true // تفاصيل مطولة
  },
   images: {
    type: [String], // روابط الصور (URLs)
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  },
});

const professionalWorkModel = mongoose.models.professionalWork || model('professionalWork', professionalWorkSchema);
export default professionalWorkModel;