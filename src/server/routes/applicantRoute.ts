import express from "express";
import { supabase } from "../../lib/supabaseClient.ts";
import { type AuthRequest, verifyCompany, verifyToken, verifyUser } from "../middleware/auth.ts";

const router = express.Router();

//submit application endpoint fix!!!
router.post("/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {

    const { id } = req.body;
    const userId = req.userId!;

    if (!id) {
        return res.status(400).json({ error: "missing id" });
    }

    try {

        // check if application already exists
        const { data: application } = await supabase
            .from("job_applications")
            .select("id")
            .eq("user_id", userId)
            .eq("advertisement_id", id)
            .maybeSingle();

        if (application)
            return res.status(409).json({ error: "application already exists" });

        // insert application
        const { error: insertError } = await supabase
            .from("job_applications")
            .insert([
                {
                    user_id: userId,
                    advertisement_id: id,
                    last_updated: new Date().toISOString()
                }
            ]);

        if (insertError) throw insertError;

        return res.json({ success: true });

    } catch (err) {
        console.error("submitApplication error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }

});


// get submitted applications endpoint fix!!!
router.get("/user/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userid = req.userId;

        //get all submitted applications
        const { data: submit, error: submitError } = await supabase
            .from("job_applications")
            .select("id, status, last_updated, advertisement_id, advertisement:advertisement(title)")
            .eq("user_id", userid)

        if (submitError) throw submitError;

        //get all work
        const { data: work, error: workError } = await supabase
            .from("employees")
            .select("id, position, job_title, hourly_wage, hire_date, company:companies(name)")
            .eq("user_id", userid)

        if (workError) throw workError;

        res.json({
            success: true,
            submit: submit || [],
            work: work || [],
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
    const companyId = req.companyId;

    try {
        // Check if the advertisement belongs to the company
        const { data: adCheck, error: adError } = await supabase
            .from("advertisement")
            .select("id")
            .eq("id", advertisementId)
            .eq("company_id", companyId)
            .maybeSingle();

        if (adError) throw adError;

        // Block access if ad not found or not owned by company
        if (!adCheck) {
            return res.status(403).json({ error: "Access denied or advertisement not found." });
        }

        // Fetch submitted applicants with user details
        const { data: applicants, error } = await supabase
            .from("job_applications")
            .select(`
                id,
                last_updated,
                users (
                    email,
                    phone_number,
                    birth_place,
                    birth_date,
                    address,
                    nationality,
                    short_bio,
                    qualifications,
                    lname,
                    fname
                )
            `)
            .eq("advertisement_id", advertisementId)
            .eq("status", "submitted");

        if (error) throw error;

        res.json({
            success: true,
            applicants,
        });

    } catch (err) {
        console.error("Error fetching applicants:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Reject application endpoint fix!!!
router.post("/applications/:id/reject", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId;

    try {
        // Minimal application data needed for ownership check
        interface ApplicantData {
            status: string;
            advertisement: {
                company_id: number;
            };
        }

        // Fetch application with related advertisement
        const { data: applicant, error: fetchError } = await supabase
            .from("job_applications")
            .select("status, advertisement:advertisement_id( company_id )")
            .eq("id", applicationId)
            .maybeSingle<ApplicantData>();

        if (fetchError) throw fetchError;

        if (!applicant || applicant.status !== "submitted") {
            return res.status(404).json({ error: "Application not found" });
        }

        // Security check: prevent unauthorized rejection
        if (applicant.advertisement.company_id !== companyId) {
            return res.status(403).json({
                error: "Unauthorized: You do not have permission to reject this application."
            });
        }

        // Update application status to rejected
        const { error: updateError } = await supabase
            .from("job_applications")
            .update({ status: "rejected" })
            .eq("id", applicationId);

        if (updateError) throw updateError;

        res.json({ success: true });

    } catch (err) {
        console.error("Reject application error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Download resume endpoint fix!!!
router.get("/applications/:id/resume", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id; // Application ID from URL
    const companyId = req.companyId;      // Authenticated company ID

    try {
        // Minimal application data needed for access check
        interface ApplicantData {
            user_id: number;
            advertisement: {
                company_id: number;
            };
        }

        // Fetch application data + ownership validation
        const { data: applicant, error: fetchError } = await supabase
            .from("job_applications")
            .select("user_id, advertisement:advertisement_id( company_id )")
            .eq("id", applicationId)
            .maybeSingle<ApplicantData>();

        if (fetchError) throw fetchError;

        // Application not found
        if (!applicant) {
            return res.status(404).json({ error: "Application not found" });
        }

        // Security check: prevent IDOR access
        if (applicant.advertisement.company_id !== companyId) {
            return res.status(403).json({
                error: "Unauthorized: You do not have permission to view this resume."
            });
        }

        const userId = applicant.user_id;
        const BUCKET = "resumes";

        // List files in user's resume folder
        const { data: files, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${userId}/`);

        if (listError) throw listError;

        // Find the first valid resume file
        const resumeFile = files.find(f => f.metadata && f.metadata.size > 0);

        if (!resumeFile) {
            return res.status(404).json({ error: "Resume file not found." });
        }

        const filePath = `${userId}/${resumeFile.name}`;

        // Generate signed URL (valid for 60 minutes)
        const { data, error: urlError } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrl(filePath, 3600);

        if (urlError) throw urlError;

        res.json({ success: true, url: data.signedUrl });

    } catch (err) {
        console.error("Download resume error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Accept application endpoint fix!!!
router.post("/applications/:id/accept", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const applicationId = req.params.id;
    const companyId = req.companyId;

    try {
        // Advertisement shape needed for employee creation
        interface Advertisement {
            company_id: number;
            position: string;
            title: string;
            hourly_wage: number;
        }

        // Expected query result structure
        interface ApplicantResult {
            id: number;
            last_updated: string;
            status: string;
            advertisement: Advertisement;
            user_id: number;
        }

        // Fetch application with related advertisement data
        const { data: application, error: fetchError } = await supabase
            .from("job_applications")
            .select(`
                id,
                last_updated,
                status,
                advertisement:advertisement_id (
                    company_id,
                    position,
                    title,
                    hourly_wage
                ),
                user_id
            `)
            .eq("id", applicationId)
            .maybeSingle<ApplicantResult>();

        if (fetchError) throw fetchError;

        // Application does not exist
        if (!application || application.status !== "submitted") {
            return res.status(404).json({ error: "Application not found" });
        }

        // Security check: company ownership
        if (application.advertisement.company_id !== companyId) {
            return res.status(403).json({
                error: "Unauthorized: This application belongs to another company."
            });
        }

        const advertisement = application.advertisement;

        // Create employee record from accepted application
        const { error: insertError } = await supabase
            .from("employees")
            .insert([
                {
                    user_id: application.user_id,
                    company_id: advertisement.company_id,
                    position: advertisement.position,
                    job_title: advertisement.title,
                    hourly_wage: advertisement.hourly_wage,
                }
            ]);

        if (insertError) throw insertError;

        // Update application status
        const { error: updateError } = await supabase
            .from("job_applications")
            .update({ status: "accepted" })
            .eq("id", applicationId);

        if (updateError) throw updateError;

        res.json({ success: true });

    } catch (err) {
        console.error("Accept application error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
