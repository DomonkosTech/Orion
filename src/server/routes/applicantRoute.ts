import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import {
    submitApplication,
    getUserApplications,
    getApplicantsForAdvertisement,
    rejectApplication,
    getResumeUrl,
    acceptApplication
} from "../services/applicantService.ts";

const router = express.Router();

//submit application endpoint fix!!!
router.post("/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {

    const { id } = req.body;
    const userId = req.userId!;

    if (!id) {
        return res.status(400).json({ error: "missing id" });
    }

    try {
        const result = await submitApplication(userId, id);
        if ('error' in result) {
            return res.status(409).json({ error: result.error });
        }
        return res.json({ success: true });

    } catch (err) {
        console.error("submitApplication error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }

});


// get submitted applications endpoint fix!!!
router.get("/user/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userid = req.userId!;
        const result = await getUserApplications(userid);

        res.json({
            success: true,
            submit: result.submit,
            work: result.work,
        });
    }
    catch (err) {
        console.error("get application error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


// Applicant tracking endpoint fix!!!
router.get("/advertisements/:id/applicants", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const advertisementId = req.params.id;
    const companyId = req.companyId!;

    try {
        const result = await getApplicantsForAdvertisement(advertisementId, companyId);
        
        if ('error' in result) {
             return res.status(403).json({ error: result.error });
        }

        res.json({
            success: true,
            applicants: result.applicants,
        });

    } catch (err) {
        console.error("Error fetching applicants:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Reject application endpoint fix!!!
router.post("/applications/:id/reject", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId!;

    try {
        const result = await rejectApplication(applicationId, companyId);

        if ('error' in result) {
            return res.status(result.status || 500).json({ error: result.error });
        }

        res.json({ success: true });

    } catch (err) {
        console.error("Reject application error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Download resume endpoint fix!!!
router.get("/applications/:id/resume", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id; // Application ID from URL
    const companyId = req.companyId!;      // Authenticated company ID

    try {
        const result = await getResumeUrl(applicationId, companyId);

        if ('error' in result) {
            return res.status(result.status || 500).json({ error: result.error });
        }

        res.json({ success: true, url: result.url });

    } catch (err) {
        console.error("Download resume error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Accept application endpoint fix!!!
router.post("/applications/:id/accept", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId!;

    try {
        const result = await acceptApplication(applicationId, companyId);

        if ('error' in result) {
            return res.status(result.status || 500).json({ error: result.error });
        }

        res.json({ success: true });

    } catch (err) {
        console.error("Accept application error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
