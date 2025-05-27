import { Schema,model ,mongoose} from "mongoose";

const professionalWorkSchema = new mongoose.Schema({
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  placeWorkName: {
    type: String,
    required: false 
  },
  summaryAboutWork: {
    type: String,
    required: true 
  },
  description: {
    type: String,
    required: true
  },
   images: {
    type: [String], 
    default: []
  },
  date: {
    type: Date,
    default: Date.now
  },
});
const professionalWorkModel = mongoose.models.professionalWork || model('professionalWork', professionalWorkSchema);
export default professionalWorkModel;