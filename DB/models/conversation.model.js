import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "participants.userModel",
  },
  userModel: {
    type: String,
    required: true,
    enum: ["User", "Professional"], // الأسماء الإنجليزية لنوع المستخدم
  },
});

const conversationSchema = new mongoose.Schema(
  {
    participants: [participantSchema],
  },
  { timestamps: true }
);

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
