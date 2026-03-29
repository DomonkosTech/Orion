import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import { getCompanySystemMessages, getUserSystemMessages, markSystemMessageAsRead } from "../service/systemmessageService.ts";

const router = express.Router();


// Get all notifications for the logged-in account
// GET /notifications  (user version)
router.get("/", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const data = await getUserSystemMessages(userId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /notifications/company  (company version)
router.get("/company", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getCompanySystemMessages(companyId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Mark a notification as read
// PATCH /notifications/:id/read  (user version)
router.patch("/:id/read", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const targetId = req.userId;
        const messageId = Number(req.params.id);
        const targetType = "USER";
        if (!targetId || !messageId || !targetType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await markSystemMessageAsRead(targetId, messageId, targetType);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// PATCH /notifications/:id/read/company  (company version)
router.patch("/:id/read/company", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const targetId = req.companyId;
        const messageId = Number(req.params.id);
        const targetType = "COMPANY";
        if (!targetId || !messageId || !targetType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await markSystemMessageAsRead(targetId, messageId, targetType);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;
