import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import * as advertisementService from "../service/advertisementService.ts";

const router = express.Router();

// Create advertisement
// POST /advertisements
router.post("/advertisements", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const advertisement = await advertisementService.createAdvertisement(companyId, req.body);

        res.json({ success: true, advertisement });
    } catch (error) {
        const err = error as Error;
        console.error("Advertisement creation error:", err);
        if (err.message.includes("Please fill in") || err.message.includes("Hourly wage") || err.message.includes("maximum limit")) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get own company advertisements
// GET /companies/me/advertisements
router.get("/companies/me/advertisements", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const advertisements = await advertisementService.getCompanyAdvertisements(companyId);

        res.json({
            success: true,
            advertisements
        });

    } catch (error) {
        console.error("Advertisement fetch error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get top 3 advertisements (public, no auth required)
// GET /advertisements?sort=top&limit=3
// Merges old /advertisements/top3 endpoint - must be before /:id
router.get("/advertisements/top3", async (_req, res) => {
    try {
        const advertisements = await advertisementService.gettopAdvertisements();

        res.json({
            success: true,
            advertisements,
        });

    } catch (err) {
        console.error("get-top-advertisements-info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


// Search/filter advertisements (public, no auth required)
// GET /advertisements/search?q=...&location=...&position=...&hourly_wage=...&page=...&limit=...
// Replaces old /advertisements2 endpoint
router.get("/advertisements/search", async (req, res) => {
    try {
        const q = String(req.query.q ?? "");
        const location = String(req.query.location ?? "");
        const position = String(req.query.position ?? "");
        const hourly_wage = Number(req.query.hourly_wage ?? "");
        const page = Number(req.query.page ?? "1");
        const limit = Number(req.query.limit ?? "10");

        const { advertisements } = await advertisementService.getAllAdvertisements2(q, location, position, hourly_wage, page, limit);
        res.json({
            success: true,
            advertisements,
        });

    } catch (err) {
        console.error("get-advertisements-info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


// Get single advertisement by ID
// GET /advertisements/:id
// Accessible by both users and companies (verifyToken only)
// Replaces old /advertisement/:id (company) and /advertisements/:id (user)
router.get("/advertisements/:id", verifyToken, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
        const advertisement = await advertisementService.getAdvertisementById(id);

        if (!advertisement) {
            return res.status(404).json({ error: "not found" });
        }

        res.json({
            success: true,
            advertisement,
        });

    } catch (err) {
        console.error("Error while fetching advertisement info:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Get all advertisements (for authenticated users)
// GET /advertisements
router.get("/advertisements", verifyToken, verifyUser, async (_req, res) => {
    try {
        const advertisements = await advertisementService.getAllAdvertisements();

        res.json({
            success: true,
            advertisements,
        });

    } catch (err) {
        console.error("get-advertisements-info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


// Update advertisement info
// PATCH /advertisements/:id
router.patch("/advertisements/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const id = req.params.id;
    const companyId = req.companyId;

    try {
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const updatedadvertisement = await advertisementService.updateAdvertisement(id, companyId, req.body);

        res.json({
            success: true,
            updatedadvertisement
        });

    } catch (err) {
        console.error("Update advertisement info error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Increment view/click counter
// PATCH /advertisements/:id/views
router.patch("/advertisements/:id/views", async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ success: false, message: "Missing id" });
        }

        await advertisementService.incrementClickCount(id);
        res.json({ success: true });
    } catch (err) {
        console.error("Update advertisement counter info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


// Update advertisement status (active/inactive)
// PATCH /advertisements/:id/status
router.patch("/advertisements/:id/status", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const id = req.params.id;
    const companyId = req.companyId;

    if (!id || req.body.status === undefined || !companyId) {
        return res.status(400).json({ success: false, message: "Missing id or status" });
    }

    try {
        await advertisementService.updateAdvertisementStatus(id, req.body.status, companyId);
        res.json({ success: true });
    } catch (err) {
        console.error("Update advertisement status error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


export default router;
