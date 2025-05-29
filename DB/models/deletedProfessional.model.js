// models/deletedProfessional.model.js
import mongoose from 'mongoose';

const deletedProfessionalSchema = new mongoose.Schema({
  professionalId: { type: mongoose.Schema.Types.ObjectId },
  username: String,
  email: String,
  phoneNumber: String,
  birthdate: Date,
  gender: {
    type: String,
    enum: ["ذكر", "أنثى"]
  },
  professionField: {
    type: String,
    enum: ["التكنولوجيا", "الكهربائيات", "ورشات البناء"]
  },
  governorate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Governorate"
  },
  originalGovernorate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Governorate"
  },
  usertype: {
    type: String,
    enum: ["مستخدم", "مهني"]
  },
  password: { 
     type: String,
     required: true 
     },
  deleteReason: { type: String, required: true },
  deletedAt: { type: Date, default: Date.now }
});

const DeletedProfessionalModel = mongoose.models.DeletedProfessional || mongoose.model('DeletedProfessional', deletedProfessionalSchema);
export default DeletedProfessionalModel;
