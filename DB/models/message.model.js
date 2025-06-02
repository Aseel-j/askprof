import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "sender.userModel",
      },
      userModel: {
        type: String,
        required: true,
        enum: ["User", "Professional"],
      },
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
