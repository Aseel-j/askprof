import Conversation from "../../../DB/models/conversation.model.js";
import Message from "../../../DB/models/message.model.js";
import jwt from 'jsonwebtoken';
import User from '../../../DB/models/user.model.js';
import Professional   from "../../../DB/models/professional.model.js";

// جلب محادثات المستخدم/المهني
export const getConversations = async (req, res) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ message: "رمز التوثيق مفقود أو غير صالح" });
  }

  try {
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
    const userId = decoded.id;
    const userModel = decoded.usertype === "مهني" ? "Professional" : "User";

    const conversations = await Conversation.find({
      participants: { $elemMatch: { userId, userModel } },
    });

    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const other = conv.participants.find(
          (p) => !p.userId.equals(userId)
        );

        const Model = other.userModel === "User" ? User : Professional;

        const otherUser = await Model.findById(other.userId).select("username profilePicture");

        return {
          _id: conv._id,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          otherParticipant: otherUser || null,
        };
      })
    );

    res.status(200).json(enrichedConversations);
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء جلب المحادثات",
      error: error.message,
    });
  }
};
// جلب الرسائل في محادثة معينة
/*export const getMessages = async (req, res) => {
  const { token } = req.headers;
  const { conversationId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "رمز التوثيق مفقود أو غير صالح" });
  }

  try {
    // فك التوكن لاستخراج بيانات المستخدم
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
    const userId = decoded.id;
    const userModel = decoded.usertype === "مهني" ? "Professional" : "User";

    // جلب المحادثة والتأكد من وجودها
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: "المحادثة غير موجودة" });

    // التحقق من أن المستخدم مشارك في المحادثة
    const isParticipant = conversation.participants.some(p =>
      p.userId.equals(userId) && p.userModel === userModel
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "أنت لست مشاركاً في هذه المحادثة" });
    }

    // جلب الرسائل الخاصة بالمحادثة مرتبة تصاعدياً حسب الوقت
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "حدث خطأ أثناء جلب الرسائل", error: error.message });
  }
};*/
export const getMessages = async (req, res) => {
  const { token } = req.headers;
  const { conversationId } = req.params;

  if (!token) {
    return res.status(401).json({ message: "رمز التوثيق مفقود أو غير صالح" });
  }

  try {
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);
    const userId = decoded.id;
    const userModel = decoded.usertype === "مهني" ? "Professional" : "User";

    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) {
      return res.status(404).json({ message: "المحادثة غير موجودة" });
    }

    const isParticipant = conversation.participants.some(
      p => p.userId.toString() === userId && p.userModel === userModel
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "أنت لست مشاركاً في هذه المحادثة" });
    }

    const senderInfo = conversation.participants.find(
      p => p.userId.toString() === userId && p.userModel === userModel
    );
    const receiverInfo = conversation.participants.find(
      p => p.userId.toString() !== userId
    );

    // جلب بيانات الطرفين
    const senderModel = senderInfo.userModel === "User" ? User : Professional;
    const receiverModel = receiverInfo.userModel === "User" ? User : Professional;

    const sender = await senderModel.findById(senderInfo.userId).select("_id username profilePicture");
    const receiver = await receiverModel.findById(receiverInfo.userId).select("_id username profilePicture");

    // جلب الرسائل
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

    res.status(200).json({
      sender,
      receiver,
      messages
    });
  } catch (error) {
    res.status(500).json({
      message: "حدث خطأ أثناء جلب الرسائل",
      error: error.message
    });
  }
};
// إنشاء محادثة جديدة بين المشاركين (أو إعادة استخدام محادثة موجودة)
export const createConversation = async (req, res) => {
  const { token } = req.headers;
  const { receiverId, receiverModel } = req.body;

  if (!token) {
    return res.status(401).json({ message: "رمز التوثيق مفقود أو غير صالح" });
  }

  if (!receiverId || !receiverModel) {
    return res.status(400).json({ message: "الرجاء إرسال معرف المستلم ونوعه" });
  }

  try {
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL);

    const sender = {
      userId: decoded.id,
      userModel: decoded.usertype === "مهني" ? "Professional" : "User",
    };

    // خريطة لتحويل الاسم العربي إلى اسم الموديل الإنجليزي
    const modelMap = {
      "مهني": "Professional",
      "مستخدم": "User",
      "User": "User",             // لو تم الإرسال بالإنجليزي أيضًا
      "Professional": "Professional"
    };

    // تنظيف وحسم نوع المستخدم
    const modelKey = receiverModel.trim().replace(/\s/g, "");
    const mappedModel = modelMap[modelKey];

    if (!mappedModel) {
      return res.status(400).json({ message: "نوع المستخدم غير معروف" });
    }

    const receiver = {
      userId: receiverId,
      userModel: mappedModel,
    };

    const participants = [sender, receiver];

    // تحقق من وجود المحادثة سابقًا
    const existing = await Conversation.findOne({
      participants: { $all: participants.map(p => ({ $elemMatch: p })) },
    });

    if (existing) return res.status(200).json(existing);

    // إنشاء المحادثة
    const newConversation = new Conversation({ participants });
    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ message: "فشل في إنشاء المحادثة", error: error.message });
  }
};
// إرسال رسالة في محادثة
export const sendMessage = async (req, res) => {
  const { token } = req.headers;
  const { conversationId, text } = req.body;

  if (!token) {
    return res.status(401).json({ message: "Token is missing" });
  }
    // فك التوكن
    const decoded = jwt.verify(token, process.env.LOGIN_SIGNAL); // استخدم نفس المتغير لديك

    // استخراج المرسل من التوكن
    const sender = {
      userId: decoded.id, // نفس الحقل في التوكن
      userModel: decoded.usertype === "مهني" ? "Professional" : "User"
    };

    const message = new Message({
      conversationId,
      sender,
      text
    });

    await message.save();

    res.status(201).json(message);

};
