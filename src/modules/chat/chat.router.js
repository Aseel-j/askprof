import express from "express";
import * as controller from './chat.controller.js'
import { asyncHandler } from '../../utils/catchError.js';
import validation from '../../middleware/validation.js';
import { searchByNameSchema } from "./chat.validation.js";
const router = express.Router();

router.get("/getconversations", asyncHandler(controller.getConversations));
router.get("/messages/:conversationId", asyncHandler(controller.getMessages));
router.post("/conversations", asyncHandler(controller.createConversation));
router.post("/messages", asyncHandler(controller.sendMessage));
router.get('/searchByNameSchema',validation(searchByNameSchema),asyncHandler(controller.searchByNameSchema));


export default router;
