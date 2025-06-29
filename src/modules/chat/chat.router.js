import express from "express";
import * as controller from './chat.controller.js';
import { asyncHandler } from '../../utils/catchError.js';
const router = express.Router();
//ارجاع المحادثات
router.get("/getconversations", asyncHandler(controller.getConversations));
//ارجاع المسجات
router.get("/messages/:conversationId", asyncHandler(controller.getMessages));
//انشاء محاداث
router.post("/conversations", asyncHandler(controller.createConversation));
//ارسال مسج
router.post("/messages", asyncHandler(controller.sendMessage));

export default router;
