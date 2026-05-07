import { supabase } from "../../lib/supabaseClient.ts";
import { userUpdateProfileSchema } from "../../validation/Validation.ts";

// Environment variable for encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Interface for user profile data, allowing partial updates
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
    // 1. Ensure encryption key is configured for secure operations
    if (!ENCRYPTION_KEY) {
        throw new Error("Encryption key not configured");
    }

    // 2. Fetch basic user details from the 'users' table
    const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

    if (userError) throw userError;
    if (!user) return null;

    // 3. Retrieve and decrypt sensitive documents using a Supabase Remote Procedure Call (RPC)
    const { data: documents, error: documentsError } = await supabase.rpc(
        "get_decrypted_documents",
        {
            p_user_id: userId,
            p_encryption_key: ENCRYPTION_KEY
        }
    );

    if (documentsError) throw documentsError;

    // 4. Check for the presence of an uploaded resume in the storage bucket
    const BUCKET = "resumes";
    const { data: files, error: storageError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`); // List files within the user's specific folder

    if (storageError) throw storageError;

    // Filter out empty or placeholder files to accurately determine if a resume exists
    const hasResume = Array.isArray(files) && files.some(file => file.metadata && file.metadata.size > 0);

    return { user, documents, hasResume };
};

// Update user profile and encrypted documents
export const updateUserProfile = async (userId: number, data: UserProfileData) => {
    // 1. Validate input data using Zod schema for data integrity
    const validation = userUpdateProfileSchema.safeParse(data);
    if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
    }

    const {
        email, phone_number, birth_place, birth_date, address,
        tax_number, nationality, short_bio, qualifications,
        lname, fname, documents
    } = data;

    // 2. Update standard user profile fields in the 'users' table
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

    // 3. If sensitive documents are provided, update them securely
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

    // 1. Check if a resume already exists for the user to enforce the one-file limit
    const { data: existingFiles, error: listError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`); // List files in the user's resume folder

    if (listError) throw listError;

    // Filter out any empty or placeholder files
    const realFiles = (existingFiles || []).filter(f => f.metadata && f.metadata.size > 0);
    if (realFiles.length > 0) {
        throw new Error("You have already uploaded a resume. We only accept one file per user.");
    }

    // 2. Sanitize the filename to ensure it's web-safe and consistent
    const safeName = file.originalname
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "");

    const filePath = `${userId}/${Date.now()}_${safeName}`; // Create a unique file path

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

    // 1. List all files in the user's resume folder
    const { data: files, error: listError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`);

    if (listError) throw listError;

    if (!files || files.length === 0) {
        throw new Error("No uploaded resume found.");
    }

    // 2. Filter for actual resume files (ignoring potential empty directory markers)
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

// Increment profile views
export const incrementProfileViews = async (userId: number) => {
    // Call Supabase RPC to increment profile views
    const { error } = await supabase.rpc("increment_profile_views", {
        p_user_id: userId
    });
    if (error) throw error;
    return true;
}

// Increment resume views
export const incrementResumeViews = async (userId: number) => {
    // Call Supabase RPC to increment resume views
    const { error } = await supabase.rpc("increment_resume_views", {
        p_user_id: userId
    });
    if (error) throw error;
    return true;
}

// Get user dashboard statistics
export const getUserDashboardData = async (userId: number) => {
    // Call Supabase RPC to get user dashboard statistics
    const { data, error } = await supabase
        .rpc("get_user_dashboard_stats", { p_user_id: userId });
    if (error) throw error;

    return data;
}

// Get a signed URL for the user's resume
export const getResumeUrl = async (userId: number) => {
    const BUCKET = "resumes";

    // 1. List files in the user's resume folder to find the resume file
    const { data: files, error: listError } = await supabase
        .storage
        .from(BUCKET)
        .list(`${userId}/`);

    if (listError) throw listError;

    // 2. Find the first valid resume file (ignoring empty placeholders)
    const resumeFile = files.find(f => f.metadata && f.metadata.size > 0);

    if (!resumeFile) {
        return null;
    }

    const filePath = `${userId}/${resumeFile.name}`;

    // 3. Generate a signed URL for the resume, valid for 60 minutes (3600 seconds)
    const { data, error: urlError } = await supabase
        .storage
        .from(BUCKET)
        .createSignedUrl(filePath, 3600);

    if (urlError) throw urlError;

    return { url: data.signedUrl };
}

// Add an advertisement to favorites
export const addFavorite = async (userId: number, advertisementId: number) => {
    // Insert a new record into the 'favorites' table
    const { error } = await supabase
        .from("favorites")
        .insert({ user_id: userId, advertisement_id: advertisementId });

    if (error) throw error;
}

// Get user's favorite advertisements
export const getFavorites = async (userId: number, includeAdvertisement: boolean) => {
    let favorites;

    // Conditionally fetch full advertisement details or just their IDs
    if (includeAdvertisement) {
        const { data, error } = await supabase
            .from("favorites")
            .select(
                "advertisement(id,title,position,location,hourly_wage,tasks,requirements,job_description)"
            )
            .eq("user_id", userId);

        if (error) throw error;
        favorites = data;
    } else {
        const { data, error } = await supabase
            .from("favorites")
            .select("advertisement_id")
            .eq("user_id", userId);

        if (error) throw error;
        favorites = data;
    }

    return favorites;
};

// Remove an advertisement from favorites
export const removeFavorite = async (userId: number, advertisementId: number) => {
    // Delete the record from the 'favorites' table
    const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("advertisement_id", advertisementId);

    if (error) throw error
};
