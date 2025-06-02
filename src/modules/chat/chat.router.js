import express from "express";
import * as controller from './chat.controller.js'
import { asyncHandler } from '../../utils/catchError.js';

const router = express.Router();

router.get("/conversations/:userId/:userModel", asyncHandler(controller.getConversations));
router.get("/messages/:conversationId", asyncHandler(controller.getMessages));
router.post("/conversations", asyncHandler(controller.createConversation));
router.post("/messages", asyncHandler(controller.sendMessage));

export default router;
