import express from "express";
import {type AuthRequest, verifyCompany, verifyToken, verifyUser,} from "../middleware/auth.ts";
import {getAllCompanyChatPartners, getAllUserChatPartners} from "../Controller/messageController.ts";
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




export default router;
