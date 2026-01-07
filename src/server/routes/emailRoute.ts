import express from "express";
import {sendEmail, activateEmail} from "../services/emailService.ts"

const router = express.Router();


router.post("/user/verification", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }

        await sendEmail(email);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while validating user email:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

router.patch("/user/verification", async (req, res) => {
    try {
        const {token} = req.body;
        if (!token) {
            res.status(400).json({error: "Missing token"});
            return;
        }

        await activateEmail(token);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while activating user email:", err);
    }
})

export default router;
