import express from "express";
import { type AuthRequest, verifyToken } from "../middleware/auth.ts";
import * as companyService from "../services/companyService.ts";

const router = express.Router();

// company get info: user profile fix!!!
router.get("/company/profile", verifyToken, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        // Ensure company ID is present (though verifyToken should handle this context)
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const company = await companyService.getCompanyProfile(companyId);

        if (!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        // Send successful response
        res.json({
            success: true,
            company,
        });

    } catch (err) {
        console.error("Error while fetching company info:", err);
        res.status(500).json({ error: "Internal server error while fetching company info" });
    }
});


//update company info endpoint fix!!!
router.patch("/company/profile", verifyToken, async (req: AuthRequest, res) => {
    try {
        const companyId = req.companyId;
        // Ensure company ID is present
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const updatedCompany = await companyService.updateCompanyProfile(companyId, req.body);

        res.json({
            success: true,
            company: updatedCompany
        });

    } catch (err) {
        console.error("Update company info error:", err);
        res.status(500).json({ error: "Update failed" });
    }
});

export default router;
