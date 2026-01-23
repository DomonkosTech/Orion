import express from "express";
import {type AuthRequest, verifyCompany, verifyToken, verifyUser,} from "../middleware/auth.ts";
import {
    getAllCompanyChatPartners,
    getAllUserChatPartners,
    getChatMessages,
    sendMessage
} from "../Controller/messageController.ts";
const router = express.Router();

// get all chat partners for the user
router.get("/user", verifyToken, verifyUser, async (req: AuthRequest, res) => {
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

// get all chat partners for the company
router.get("/company",verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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

// get all messages for the user
router.get("/user/message/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const companyId = Number(req.params.id);
        const readertype= 'USER'

        if (!userId || !companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getChatMessages(userId, companyId, readertype);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error("get chat(user version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// get all messages for the company
router.get("/company/message/:id",verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const userId = Number(req.params.id);
        const companyId = req.companyId;
        const readertype= 'COMPANY'

        if (!companyId || !userId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getChatMessages(userId, companyId, readertype);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error("get chat(company version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

// insert chat(user version) messages
router.post("/user/send", verifyToken,verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const companyId = req.body.companyId;
        const message = req.body.message;
        const senderType= "USER";
        if (!userId || !companyId || !message) {
            return res.status(400).json({ error: "Company access denied" });
        }
        const data = await sendMessage(userId, companyId,message, senderType);
        res.json({ success: true, data});
    }
    catch (error) {
        console.error("insert chat(user version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// insert chat(company version) messages
router.post("/company/send", verifyToken,verifyCompany, async (req: AuthRequest, res) => {
    try {
        const userId = req.companyId;
        const companyId = req.body.userId;
        const message = req.body.message;
        const senderType= "COMPANY";
        if (!userId || !companyId || !message) {
            return res.status(400).json({ error: "Company access denied" });
        }
        const data = await sendMessage(userId, companyId,message, senderType);
        res.json({ success: true, data});
    }
    catch (error) {
        console.error("insert chat(company version) messages error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
