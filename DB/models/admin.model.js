//Admin Schema
import mongoose from "mongoose";
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  role:{
     type: String,
      enum:["admin"],
  },
  sendCode: String,
  codeExpire: Date,
}, {
  timestamps: true,
});
const AdminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default AdminModel;
