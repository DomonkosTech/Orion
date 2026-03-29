import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import {
    getAllCompanyChatPartners,
    getAllUserChatPartners,
    getChatMessages,
    sendMessage
} from "../Controller/messageService.ts";
const router = express.Router();

// Get all conversations (chat partners) for the logged-in account
// GET /messages/conversations
// verifyToken resolves both user and company — two routes, same URL, different middleware
router.get("/conversations", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ error: "User access denied" });
        }
        const data = await getAllUserChatPartners(userId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/conversations/company", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getAllCompanyChatPartners(companyId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get messages in a specific conversation
// GET /messages/conversations/:id
router.get("/conversations/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const companyId = Number(req.params.id);
        const readertype = 'USER';

        if (!userId || !companyId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const data = await getChatMessages(userId, companyId, readertype);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error("get chat(user version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get("/conversations/:id/company", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const userId = Number(req.params.id);
        const companyId = req.companyId;
        const readertype = 'COMPANY';

        if (!companyId || !userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const data = await getChatMessages(userId, companyId, readertype);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error("get chat(company version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Send a message
// POST /messages  (user version)
router.post("/", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const companyId = req.body.companyId;
        const message = req.body.message;
        const senderType = "USER";
        if (!userId || !companyId || !message) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const data = await sendMessage(userId, companyId, message, senderType);
        res.json({ success: true, data });
    } catch (error) {
        console.error("insert chat(user version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /messages/company  (company version)
router.post("/company", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const userId = req.body.userId;
        const companyId = req.companyId;
        const message = req.body.message;
        const senderType = "COMPANY";
        if (!userId || !companyId || !message) {
            console.log(userId, companyId, message);
            return res.status(400).json({ error: "Missing required fields" });
        }
        const data = await sendMessage(userId, companyId, message, senderType);
        res.json({ success: true, data });
    } catch (error) {
        console.error("insert chat(company version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
