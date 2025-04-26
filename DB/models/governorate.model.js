import { Schema, model ,mongoose} from "mongoose";

const governorateSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

const GovernorateModel = mongoose.models.Governorate||model('Governorate', governorateSchema);
export default GovernorateModel;
