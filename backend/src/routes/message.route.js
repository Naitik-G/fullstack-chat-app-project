import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, addReactionToMessage,  markMessagesAsRead } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);
router.post("/react/:id", protectRoute, addReactionToMessage);
router.post("/read/:chatRoomId", protectRoute, markMessagesAsRead); // NEW: Chat room ID as param



export default router;
