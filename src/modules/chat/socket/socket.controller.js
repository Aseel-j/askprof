import Message  from "../../../../DB/models/message.model.js";

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected", socket.id);

    socket.on("joinRoom", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, senderId, senderModel, text } = data;

      const message = await Message.create({
        conversationId,
        sender: { id: senderId, model: senderModel },
        text
      });

      io.to(conversationId).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
};
