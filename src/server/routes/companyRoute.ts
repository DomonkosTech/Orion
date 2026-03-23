import express from "express";
import { type AuthRequest, verifyToken } from "../middleware/auth.ts";
import * as companyService from "../Controller/companyController.ts";
import {getCompanystat} from "../Controller/companyController.ts";

const router = express.Router();

// company get info: user profile fix!!!
router.get("/me", verifyToken, async (req: AuthRequest, res) => {
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
router.patch("/me", verifyToken, async (req: AuthRequest, res) => {
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


// get company stats
router.get("/me/stats",verifyToken, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        if (!companyId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const data = await getCompanystat(companyId)
        return res.json({success: true, data})
    }
    catch (err) {
        console.error("Error while fetching company info:", err);
        res.status(500).json({ error: "Internal server error while fetching company info" });
    }
});

//get all employees endpoint for company
router.get("/me/employees", verifyToken, async (req: AuthRequest, res) => {

    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }

        const employees = await companyService.getEmployees(companyId);

        res.json({
            success: true,
            employees
        });

    } catch (error) {
        console.error("Get employees failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

//delete employee
router.delete("/me/employees/:id", verifyToken, async (req: AuthRequest, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const { success, deletedEmployee } = await companyService.deleteEmployee(employeeId, companyId);

        if (!deletedEmployee) {
            return res.status(404).json({ error: "Employee not found" });
        }
        res.json({ success });
    } catch (error) {
        console.error("Delete employees failed:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
