import express from "express";
import { loginUser, registerUser, loginCompany, registerCompany, verifyToken } from "../service/authService.ts";

const router = express.Router();

interface ServiceError {
    status?: number;
    message?: string;
}

// user Login endpoint fix!!!
router.post("/user/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const result = await loginUser(email, password, rememberMe);
        
        res.cookie("auth_token", result.token, result.cookieOptions);
        res.json({ success: true, message: "Login successful" });

    } catch (err) {
        const error = err as ServiceError;
        console.error("Error during login processing:", error);
        const status = error.status || 500;
        const message = error.message || "Internal server error during login processing";
        return res.status(status).json({ error: message });
    }
});


//user register endpoint fix!!!
router.post("/user/register", async (req, res) => {
    try {
        const result = await registerUser(req.body);
        res.json(result);
    } catch (err) {
        const error = err as ServiceError;
        const status = error.status || 500;
        const message = error.message || "Unexpected server error";
        res.status(status).json({ error: message });
    }
});


//company login endpoint fix!!!
router.post("/company/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;
        const result = await loginCompany(email, password, rememberMe);
        
        res.cookie("auth_token", result.token, result.cookieOptions);
        res.json({ success: true, message: "Login successful" });
    }
    catch (err) {
        const error = err as ServiceError;
        console.error("Error during login processing:", error);
        const status = error.status || 500;
        const message = error.message || "Internal server error during login processing";
        return res.status(status).json({ error: message });
    }
});

//register endpoint fix!!!
router.post("/company/register", async (req, res) => {
    try {
        const result = await registerCompany(req.body);
        res.json(result);
    } catch (err) {
        const error = err as ServiceError;
        console.error(error);
        const status = error.status || 500;
        const message = error.message || "Unexpected server error";
        res.status(status).json({ error: message });
    }
});


// Logout endpoint
router.post("/logout", (_req, res) => {
    try {
        // A 'auth_token' cookie törlése
        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.json({ success: true, message: "Sikeres kijelentkezés" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Kijelentkezés sikertelen" });
    }
});


// Check auth endpoint
router.get("/status", async (req, res) => {
    const token = req.cookies.auth_token;
    const result = await verifyToken(token);
    res.json(result);
});

export default router;
