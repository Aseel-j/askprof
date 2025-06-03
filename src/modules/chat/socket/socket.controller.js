import Message from "../../../../DB/models/message.model.js";

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // ✅ انضمام المستخدم لغرفة المحادثة
    socket.on("joinRoom", (conversationId) => {
      socket.join(conversationId);
      console.log(`👥 انضم للغرفة: ${conversationId}`);
    });

    // ✅ استقبال الرسالة من المستخدم
    socket.on("sendMessage", async (data) => {
      const { conversationId, senderId, senderModel, text } = data;

      try {
        // ✅ حفظ الرسالة في قاعدة البيانات
        const message = await Message.create({
          conversationId,
          sender: { userId: senderId, userModel: senderModel }, // ✅ التعديل هنا
          text
        });

        // ✅ بث الرسالة لكل المشاركين في نفس الغرفة
        io.to(conversationId).emit("newMessage", message);
        console.log("📨 تم إرسال الرسالة:", message.text);
      } catch (err) {
        console.error("❌ خطأ أثناء إرسال الرسالة:", err);
      }
    });

    // ✅ عند قطع الاتصال
    socket.on("disconnect", () => {
      console.log("🚫 User disconnected:", socket.id);
    });
  });
};

/*import Message  from "../../../../DB/models/message.model.js";

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
};*/
