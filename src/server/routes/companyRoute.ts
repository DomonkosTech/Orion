import express from "express";
import { supabase } from "../../lib/supabaseClient.ts";
import { type AuthRequest, verifyToken } from "../middleware/auth.ts";

const router = express.Router();

// company get info: user profile fix!!!
router.get("/company/profile", verifyToken, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        // Fetch basic company data
        const { data: company, error } = await supabase
            .from("companies")
            .select("*")
            .eq("id", companyId)
            .maybeSingle();

        if (error) throw error;

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
        const data = req.body;
        const companyId = req.companyId;

        // Update basic company fields
        const { data: updatedCompany, error } = await supabase
            .from("companies")
            .update({
                name: data.name,
                phone_number: data.phone_number,
                address: data.address,
                tax_number: data.tax_number,
                contact_person_name: data.contact_person_name,
                activity_scope: data.activity_scope,
                website: data.website,
                short_description: data.short_description
            })
            .eq("id", companyId)
            .select()
            .single();

        if (error) throw error;

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
