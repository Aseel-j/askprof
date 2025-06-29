import { Schema, model, mongoose } from "mongoose";
const reviewSchema = new Schema({
  user: {
    type:Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  professional: {
    type:Schema.Types.ObjectId,
    ref: 'Professional', 
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  date: {
    type: Date,
    default: Date.now
  }
});
const ReviewModel = mongoose.models.Review || model('Review', reviewSchema);
export default ReviewModel;
