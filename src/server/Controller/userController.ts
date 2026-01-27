import { supabase } from "../../lib/supabaseClient.ts";
import { userUpdateProfileSchema } from "../../validation/Validation.ts";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

interface UserProfileData {
    email?: string;
    phone_number?: string;
    birth_place?: string;
    birth_date?: string;
    address?: string;
    tax_number?: string;
    nationality?: string;
    short_bio?: string;
    qualifications?: string;
    lname?: string;
    fname?: string;
    documents?: {
        personal_id: string;
        address_card_number: string;
    };
}

// Fetch user profile, decrypted documents, and resume status
export const getUserProfile = async (userId: number) => {
    // Ensure server is configured correctly for decryption
    if (!ENCRYPTION_KEY) {
        throw new Error("Encryption key not configured");
    }

    // 1. Fetch basic user details from the database
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (userError) throw userError;
    if (!user) return null;

    // 2. Retrieve and decrypt sensitive documents using a secure RPC call
    const { data: documents, error: documentsError } = await supabase.rpc(
        "get_decrypted_documents",
        {
            p_user_id: userId,
            p_encryption_key: ENCRYPTION_KEY
        }
    );

    if (documentsError) throw documentsError;

    // 3. Check if the user has an uploaded resume in the storage bucket
    const BUCKET = "resumes";
    const { data: files, error: storageError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`);

    if (storageError) throw storageError;

    // Filter out empty/placeholder files to determine actual presence
    const hasResume = Array.isArray(files) && files.some(file => file.metadata && file.metadata.size > 0);

    return { user, documents, hasResume };
};

// Update user profile and encrypted documents
export const updateUserProfile = async (userId: number, data: UserProfileData) => {

    // Zod validation for input data
    const validation = userUpdateProfileSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
    }

    const {
        email, phone_number, birth_place, birth_date, address,
        tax_number, nationality, short_bio, qualifications,
        lname, fname, documents
    } = data;

    // 1. Update standard user profile fields
    const { data: updatedUser, error: userError } = await supabase
        .from("users")
        .update({
            email, phone_number, birth_place, birth_date, address,
            tax_number, nationality, short_bio, qualifications,
            lname, fname
        })
        .eq("id", userId)
        .select("id, email, lname, fname, phone_number")
        .single();

    if (userError) throw userError;

    // 2. Update sensitive documents if provided (requires encryption)
    if (documents) {
        if (!ENCRYPTION_KEY) {
            throw new Error("Encryption key missing");
        }

        // Call RPC to encrypt and store the new document data
        const { error: docError } = await supabase.rpc("update_encrypted_documents", {
            p_user_id: userId,
            p_personal_id: documents.personal_id,
            p_address_card_number: documents.address_card_number,
            p_encryption_key: ENCRYPTION_KEY
        });

        if (docError) throw docError;
    }

    return { user: updatedUser, documents: documents ? [documents] : [] };
};

// Upload a resume file to storage (max 1 file per user)
export const uploadResume = async (userId: number, file: Express.Multer.File) => {
    const BUCKET = "resumes";

    // 1. Check if a resume already exists (enforce 1 file limit)
    const { data: existingFiles, error: listError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`);

    if (listError) throw listError;

    const realFiles = (existingFiles || []).filter(f => f.metadata && f.metadata.size > 0);
    if (realFiles.length > 0) {
        throw new Error("Már töltöttél fel önéletrajzot. Csak egy fájl engedélyezett.");
    }

    // 2. Sanitize filename to prevent issues with special characters
    const safeName = file.originalname
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${userId}/${Date.now()}_${safeName}`;

    // 3. Upload the file buffer to Supabase Storage
    const { error: uploadError } = await supabase
        .storage
        .from(BUCKET)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
        });

    if (uploadError) throw uploadError;

    return filePath;
};

// Delete the user's resume from storage
export const deleteResume = async (userId: number) => {
    const BUCKET = "resumes";

    // 1. List files in the user's folder
    const { data: files, error: listError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`);

    if (listError) throw listError;

    if (!files || files.length === 0) {
        throw new Error("No uploaded resume found.");
    }

    // 2. Filter for valid files (ignore empty placeholders)
    const realFiles = files.filter(f => f.metadata && f.metadata.size > 0);
    if (realFiles.length === 0) {
        throw new Error("No removable resume found.");
    }

    // 3. Construct paths and remove files
    const filePaths = realFiles.map(file => `${userId}/${file.name}`);

    const { error: removeError } = await supabase
        .storage
        .from(BUCKET)
        .remove(filePaths);

    if (removeError) throw removeError;

    return true;
};


export const incrementProfileViews = async (userId: number) => {
    const { error } = await supabase.rpc("increment_profile_views", {
        p_user_id: userId
    });
    if (error) throw error;
    return true;
}


export const incrementResumeViews = async (userId: number) => {
    const { error } = await supabase.rpc("increment_resume_views", {
        p_user_id: userId
    });
    if (error) throw error;
    return true;
}


export const getuserdashboarddata = async (userId: number) => {
    const { data: stats, error } = await supabase
        .rpc("get_user_dashboard_stats", { p_user_id: userId });
    if (error) throw error;
    return stats;
}

