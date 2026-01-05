import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import * as advertisementService from "../services/advertisementService.ts";

const router = express.Router();

// Create advertisement endpoint fix!!!
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
        // Handle specific business logic errors with 400 Bad Request
        if (err.message.includes("Please fill in") || err.message.includes("Hourly wage") || err.message.includes("maximum limit")) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get advertisements by company id endpoint fix!!!
router.get("/company/advertisements", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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


// get advertisment info endpoint fix!!!
router.get("/advertisement/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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
    }
);

// get advertisment info endpoint by user fix!!!
router.get("/advertisements/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
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


//update advertisment info endpoint fix!!!
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


//get all advertisments fix!!!
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

//update klick number
router.patch("/advertisements/:id/views",  async (req , res) => {
    try {
        const id = req.params.id;

        if (!id) {
            return res.status(400).json({ success: false, message: "Missing id" });
        }

        await advertisementService.incrementClickCount(id)
        res.json({ success: true });
    } catch (err) {
        console.error("Update advertisement counter info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
})

//update advertisement status
router.patch("/advertisements/:id/status", verifyToken, verifyCompany, async (req: AuthRequest, res) => {

    const id = req.params.id;
    const companyId = req.companyId;


    if (!id || req.body.status === undefined || !companyId) {
        return res.status(400).json({ success: false, message: "Missing id or status" });
    }

    try {

        await advertisementService.updateAdvertisementStatus(id, req.body.status, companyId);
        res.json({
            success: true})
    }
    catch (err) {
        console.error("Update advertisement status error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
})

//get all employees endpoint for company
router.get("/employees", verifyToken, verifyCompany, async (req: AuthRequest, res) => {

    try {
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }

        const employees = await advertisementService.getEmployees(companyId);

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
router.delete("/employees/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const employeeId = parseInt(req.params.id);
        const companyId = req.companyId;
        if (!companyId) {
            return res.status(403).json({ error: "Company access denied" });
        }
        const { success, deletedEmployee } = await advertisementService.deleteEmployee(employeeId, companyId);

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
