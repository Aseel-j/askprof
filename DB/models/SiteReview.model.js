import { Schema, model, mongoose } from "mongoose";

const SiteReviewSchema = new Schema({
  user: {
    type:Schema.Types.ObjectId,
    ref: 'User', // يفترض أنك تملك موديل باسم User
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

const SiteReviewModel = mongoose.models.SiteReview || model('SiteReview', SiteReviewSchema);
export default SiteReviewModel;
