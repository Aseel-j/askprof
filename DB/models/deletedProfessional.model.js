import mongoose, { Schema, model } from "mongoose";

const deletedProfessionalSchema = new Schema({
  username: String,
  email: String,
  phoneNumber: String,
  professionField: String,
  rejectionReason: { type: String },
  governorate: { type: Schema.Types.ObjectId, ref: "Governorate" },
}, { timestamps: true });
const DeletedProfessionalModel = mongoose.models.DeletedProfessional || model("DeletedProfessional", deletedProfessionalSchema);
export default DeletedProfessionalModel;
