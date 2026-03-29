import express from "express";
import multer from "multer";
import {type AuthRequest, verifyCompany, verifyToken, verifyUser} from "../middleware/auth.ts";
import * as userService from "../service/userService.ts";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }// max 5 MB limit
});

// user get info: user profile, decrypted documents, and resume status fix!!!
router.get("/me", verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const result = await userService.getUserProfile(req.userId);

        if (!result) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        const err = error as Error;
        console.error("Error while fetching user info:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});


// update user profile endpoint fix!!!
router.patch("/me", verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const result = await userService.updateUserProfile(req.userId, req.body);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        const err = error as Error;
        console.error("Update profile error:", err);
        res.status(500).json({ error: err.message || "Failed to update profile" });
    }
});


// upload resume endpoint fix!!!
router.post("/me/resume", verifyToken, upload.single("resume"), async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const file = req.file;
        if (!file) return res.status(400).json({ error: "Nincs fájl kiválasztva." });

        const filePath = await userService.uploadResume(userId, file);

        return res.status(200).json({
            message: "Sikeres feltöltés",
            filePath,
        });

    } catch (err) {
        const e = err instanceof Error ? err.message : "Ismeretlen hiba";
        // Check for specific error messages to return 400 instead of 500 if needed
        if (e.includes("Már töltöttél fel")) {
            return res.status(400).json({ error: e });
        }
        return res.status(500).json({ error: e });
    }
});


// delete resume endpoint fix!!!
router.delete("/me/resume", verifyToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        await userService.deleteResume(userId);

        return res.json({ success: true, message: "Resume deleted successfully." });

    } catch (err) {
        const error = err as Error;
        console.error(error);
        if (error.message === "No uploaded resume found." || error.message === "No removable resume found.") {
            return res.status(404).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal server error" });
    }
});


router.post("/:id/views",verifyToken,verifyCompany, async (req, res) => {
    try {
        const userId = req.params.id;
        if (!Number.isInteger(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        await userService.incrementProfileViews(parseInt(userId));
        return res.json({ success: true });

    }
    catch (err) {
        const error = err as Error;
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.post("/:id/resume/views",verifyToken,verifyCompany, async (req, res) => {
    try {
        const userId = req.params.id;
        if (!Number.isInteger(userId)) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        await userService.incrementResumeViews(parseInt(userId));
        return res.json({ success: true });

    }
    catch (err) {
        const error = err as Error;
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.get("/me/stats",verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(400).json({ error: "Invalid user id" });
        }
        const stats = await userService.getUserDashboardData(userId);

        return res.json({
            success: true,
            data: { stats } // <- ez legyen, hogy statsData.data.stats működjön
        });
    }
    catch (err) {
        const error = err as Error;
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
})


router.get("/me/resume", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try{
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const result = await userService.getResumeUrl(userId);

        if (!result) {
            return res.status(404).json({ error: "Resume not found" });
        }

        res.json({ success: true, url: result.url });
    }
    catch (err) {
        console.error("get resume error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
})



// Add advertisement to favorites
// POST /users/me/favorites
router.post("/me/favorites", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const advertisementId = Number(req.body.advertisementId);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.body.advertisementId || Number.isNaN(advertisementId) || advertisementId <= 0) {
            return res.status(400).json({ error: "Invalid advertisement id" });
        }

        await userService.addFavorite(userId, advertisementId);
        res.json({ success: true });
    } catch (error) {
        console.error("Add favorite failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get user's favorite advertisements
// GET /users/me/favorites
router.get("/me/favorites", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const includeAdvertisement = req.query.includeAdvertisement === "true";
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const favorites = await userService.getFavorites(userId, includeAdvertisement);
        res.json(favorites);
    } catch (error) {
        console.error("Get favorites failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Remove advertisement from favorites
// DELETE /users/me/favorites/:id
router.delete("/me/favorites/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userId = req.userId;
        const advertisementId = Number(req.params.id);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!req.params.id || Number.isNaN(advertisementId) || advertisementId <= 0) {
            return res.status(400).json({ error: "Invalid advertisement id" });
        }

        await userService.removeFavorite(userId, advertisementId);
        res.json({ success: true });
    } catch (error) {
        console.error("Remove favorite failed:", error);
    }
});
export default router;
