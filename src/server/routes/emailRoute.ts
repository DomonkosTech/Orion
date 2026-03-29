import express from "express";
import {
    sendUserActivationEmail, activateUserAccount, sendCompanyActivationEmail, activateCompanyAccount, sendUserPasswordResetEmail,
    saveNewUserPassword, sendCompanyPasswordResetEmail, saveNewCompanyPassword
} from "../service/emailService.ts"

const router = express.Router();


router.post("/user/verify-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }

        await sendUserActivationEmail(email);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while validating user email:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});


router.post("/company/verify-email", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }

        await sendCompanyActivationEmail(email);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while validating company email:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

router.post("/user/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }

        await sendUserPasswordResetEmail(email);
        res.json({success: true});

    }
    catch (err) {
        console.error("Error while resetting user password:", err);
        res.status(500).json("Internal server error");
    }
})


router.post("/company/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({error: "Missing email"});
            return;
        }

        await sendCompanyPasswordResetEmail(email);
        res.json({success: true});

    }
    catch (err) {
        console.error("Error while resetting company password:", err);
        res.status(500).json("Internal server error");
    }
})

router.patch("/user/reset-password", async (req, res) =>{
    try {

        const {token, password} = req.body;
        if (!token || !password) {
            res.status(400).json({error: "Missing token or password"});
            return;
        }

        await saveNewUserPassword(token, password);
        res.json({success: true});

    }
    catch (err) {
        console.error("Error while resetting user password:", err);
        res.status(500).json("Internal server error");
    }
})

router.patch("/company/reset-password", async (req, res) =>{
    try {

        const {token, password} = req.body;
        if (!token || !password) {
            res.status(400).json({error: "Missing token or password"});
            return;
        }

        await saveNewCompanyPassword(token, password);
        res.json({success: true});

    }
    catch (err) {
        console.error("Error while resetting company password:", err);
        res.status(500).json("Internal server error");
    }
})


router.patch("/user/verify-email", async (req, res) => {
    try {
        const {token} = req.body;
        if (!token) {
            res.status(400).json({error: "Missing token"});
            return;
        }

        await activateUserAccount(token);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while activating user email:", err);
    }
})


router.patch("/company/verify-email", async (req, res) => {
    try {
        const {token} = req.body;
        if (!token) {
            res.status(400).json({error: "Missing token"});
            return;
        }

        await activateCompanyAccount(token);
        res.json({success: true});

    } catch (error) {
        const err = error as Error;
        console.error("Error while activating company email:", err);
    }
})

export default router;
