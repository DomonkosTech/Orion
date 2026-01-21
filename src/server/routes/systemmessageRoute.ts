import express from "express";
import {type AuthRequest, verifyCompany, verifyToken, verifyUser,} from "../middleware/auth.ts";
const router = express.Router();
import {getcompanysystemmessages, getusersystemmessages, readsystemmessage} from "../Controller/systemmessageController.ts";


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


router.get("/user/messages",verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const data = await getusersystemmessages(userId);
        res.json({ success: true, data: data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.patch("/user/messages/read/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const targetId = req.userId;
        const messageId = Number(req.params.id);
        const targetType = "USER";
        if (!targetId || !messageId || !targetType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await readsystemmessage(targetId, messageId, targetType)
        res.json({ success: true });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.patch("/company/messages/read/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const targetId = req.companyId;
        const messageId = Number(req.params.id);
        const targetType = "COMPANY";
        if (!targetId || !messageId || !targetType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        await readsystemmessage(targetId, messageId, targetType)
        res.json({ success: true });

    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router;


