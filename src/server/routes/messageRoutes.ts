import express from "express";
import { type AuthRequest, verifyCompany, verifyToken,  } from "../middleware/auth.ts";
const router = express.Router();
import {getcompanysystemmessages} from "../Controller/messageController.ts";


router.get("/company/messages",verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getcompanysystemmessages(companyId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
