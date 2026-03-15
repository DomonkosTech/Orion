import { supabase } from "../../lib/supabaseClient.ts";
import {incrementResumeViews} from "./userController.ts"
import {createsystemmessage} from "./systemmessageController.ts"

export const submitApplication = async (userId: number, advertisementId: string) => {
    // check if application already exists
    const { data: application } = await supabase
        .from("job_applications")
        .select("id")
        .eq("user_id", userId)
        .eq("advertisement_id", advertisementId)
        .maybeSingle();

    if (application)
        return { error: "application already exists" };

    // insert application
    const { error: insertError } = await supabase
        .from("job_applications")
        .insert([
            {
                user_id: userId,
                advertisement_id: advertisementId,
                last_updated: new Date().toISOString()
            }
        ]);

    if (insertError) throw insertError;

    return { success: true };
};

export const getUserApplications = async (userId: number) => {
    //get all submitted applications
    const { data: submit, error: submitError } = await supabase
        .from("job_applications")
        .select("id, status, last_updated, advertisement_id, advertisement:advertisement(title)")
        .eq("user_id", userId)

    if (submitError) throw submitError;

    //get all work
    const { data: work, error: workError } = await supabase
        .from("employees")
        .select("id, position, job_title, hourly_wage, hire_date, company:companies(name)")
        .eq("user_id", userId)

    if (workError) throw workError;

    return {
        submit: submit || [],
        work: work || [],
    };
};

export const getApplicantsForAdvertisement = async (advertisementId: string, companyId: number) => {
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
        return { error: "Access denied or advertisement not found." };
    }

    // Fetch submitted applicants with user details
    const { data: applicants, error } = await supabase
        .from("job_applications")
        .select(`
            id,
            user_id,
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
            ),
            advertisement(click_count)
        `)
        .eq("advertisement_id", advertisementId)
        .eq("status", "submitted");

    if (error) throw error;

    // Map the result to include click_count directly or nested as expected by frontend
    const mappedApplicants = applicants?.map(app => ({
        ...app,
        click_count: app.advertisement // Supabase returns it as an object because of the join
    }));

    return { applicants: mappedApplicants };
};

export const rejectApplication = async (applicationId: string, companyId: number) => {
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
        return { error: "Application not found", status: 404 };
    }

    // Security check: prevent unauthorized rejection
    if (applicant.advertisement.company_id !== companyId) {
        return {
            error: "Unauthorized: You do not have permission to reject this application.",
            status: 403
        };
    }

    // Update application status to rejected
    const { error: updateError } = await supabase
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", applicationId);

    if (updateError) throw updateError;

    return { success: true };
};

export const getResumeUrl = async (applicationId: string, companyId: number) => {
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
        return { error: "Application not found", status: 404 };
    }

    // Security check: prevent IDOR access
    if (applicant.advertisement.company_id !== companyId) {
        return {
            error: "Unauthorized: You do not have permission to view this resume.",
            status: 403
        };
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
        return { error: "Resume file not found.", status: 404 };
    }

    const filePath = `${userId}/${resumeFile.name}`;

    // Generate signed URL (valid for 60 minutes)
    const { data, error: urlError } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(filePath, 3600);

    if (urlError) throw urlError;

    await incrementResumeViews(userId)

    return { success: true, url: data.signedUrl };
};

export const acceptApplication = async (applicationId: string, companyId: number) => {
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
        return { error: "Application not found", status: 404 };
    }

    // Security check: company ownership
    if (application.advertisement.company_id !== companyId) {
        return {
            error: "Unauthorized: This application belongs to another company.",
            status: 403
        };
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

    createsystemmessage(application.user_id, 'Gratulálunk!', `Örömmel értesítjük, hogy partnercégünk kiválasztotta Önt a(z) ${advertisement.position} pozícióra. hamarosan felveszik önnel a kapcsolatot majd a további részletekkel.`, 'USER')

    if (updateError) throw updateError;

    return { success: true };
};
