import express from "express";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";
import {
    submitApplication,
    getUserApplications,
    getApplicantsForAdvertisement,
    rejectApplication,
    getResumeUrl,
    acceptApplication
} from "../service/applicantService.ts";

const router = express.Router();

// Submit application
// POST /applications
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


// Get own submitted applications (user)
// GET /users/me/applications
router.get("/users/me/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {
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


// Get applicants for an advertisement (company)
// GET /advertisements/:id/applications
router.get("/advertisements/:id/applications", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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


// Download applicant resume
// GET /applications/:id/resume
router.get("/applications/:id/resume", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId!;

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


// Accept or reject an application
// PATCH /applications/:id/status
// Body: { "status": "accepted" | "rejected" }
// Replaces POST /applications/:id/accept and POST /applications/:id/reject
router.patch("/applications/:id/status", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId!;
    const { status } = req.body;

    if (!status || !["accepted", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status. Must be 'accepted' or 'rejected'." });
    }

    try {
        let result;

        if (status === "accepted") {
            result = await acceptApplication(applicationId, companyId);
        } else {
            result = await rejectApplication(applicationId, companyId);
        }

        if ('error' in result) {
            return res.status(result.status || 500).json({ error: result.error });
        }

        res.json({ success: true });

    } catch (err) {
        console.error("Update application status error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


export default router;
