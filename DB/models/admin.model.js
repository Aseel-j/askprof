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
}, {
  timestamps: true,
});

const AdminModel = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export default AdminModel;
