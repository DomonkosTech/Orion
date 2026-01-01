import express from "express";
import multer from "multer";
import { supabase } from "../../lib/supabaseClient.ts";
import { type AuthRequest, verifyToken } from "../middleware/auth.ts";

const router = express.Router();
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }// max 5 MB limit
});

// user get info: user profile, decrypted documents, and resume status fix!!!
router.get("/user/profile", verifyToken, async (req: AuthRequest, res) => {
    try {
        // Ensure user ID is present from auth middleware
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Ensure encryption key is configured
        if (!ENCRYPTION_KEY) {
            console.error("Critical error: Encryption key not configured.");
            return res.status(500).json({ error: "Internal server configuration error" });
        }

        // Fetch basic user data (avoid select *)
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", req.userId)
            .maybeSingle();

        if (userError) throw userError;

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Fetch decrypted documents via RPC
        const { data: documents, error: documentsError } = await supabase.rpc(
            "get_decrypted_documents",
            {
                p_user_id: req.userId,
                p_encryption_key: ENCRYPTION_KEY
            }
        );

        if (documentsError) throw documentsError;

        // Check if user has a real resume file in storage
        const BUCKET = "resumes";

        const { data: files, error: storageError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${req.userId}/`);

        if (storageError) {
            console.error("Storage list error:", storageError);
            return res.status(500).json({ error: "Failed to check resume storage" });
        }

        const hasResume =
            Array.isArray(files) &&
            files.some(file => file.metadata && file.metadata.size > 0);

        // Send successful response
        res.json({
            success: true,
            user,
            documents,
            hasResume
        });

    } catch (error) {
        console.error("Error while fetching user info:", error);
        res.status(500).json({ error: "Internal server error while fetching user info" });
    }
});


// update user profile endpoint fix!!!
router.patch("/user/profile", verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const {
            email,
            phone_number,
            birth_place,
            birth_date,
            address,
            tax_number,
            nationality,
            short_bio,
            qualifications,
            lname,
            fname,
            documents
        } = req.body;

        // Update basic user fields
        const { data: updatedUser, error: userError } = await supabase
            .from("users")
            .update({
                email,
                phone_number,
                birth_place,
                birth_date,
                address,
                tax_number,
                nationality,
                short_bio,
                qualifications,
                lname,
                fname
            })
            .eq("id", req.userId)
            .select("id, email, lname, fname, phone_number")
            .single();

        if (userError) throw userError;

        // Update encrypted documents if provided
        if (documents) {
            if (!ENCRYPTION_KEY) {
                console.error("Encryption key missing");
                return res.status(500).json({ error: "Server configuration error" });
            }

            const { error: docError } = await supabase.rpc("update_encrypted_documents", {
                p_user_id: req.userId,
                p_personal_id: documents.personal_id,
                p_address_card_number: documents.address_card_number,
                p_encryption_key: ENCRYPTION_KEY
            });

            if (docError) throw docError;
        }

        res.json({
            success: true,
            user: updatedUser,
            documents: documents ? [documents] : []

        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ error: "Failed to update profile" });
    }
});


// upload resume endpoint fix!!!
router.post("/upload-resume", verifyToken, upload.single("resume"), async (req: AuthRequest, res) => {
    try {
        const userid = req.userId;

        // Get the uploaded file from the request.
        const file = req.file;
        if (!file) return res.status(400).json({ error: "Nincs fájl kiválasztva." });

        const BUCKET = "resumes";

        // List files in the user's directory to see if a resume already exists.
        const { data: existingFiles, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${userid}/`);

        if (listError) {
            console.error("Storage list error:", listError);
            return res.status(500).json({ error: "Hiba a mappa ellenőrzésekor" });
        }

        // Filter out empty placeholder files to get a count of actual files.
        const realFiles = (existingFiles || []).filter(f => f.metadata && f.metadata.size > 0);

        if (realFiles.length > 0) {
            return res.status(400).json({ error: "Már töltöttél fel önéletrajzot. Csak egy fájl engedélyezett." });
        }

        // Sanitize the original filename to create a URL-safe version.
        const safeName = file.originalname
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "");

        // Create a unique file path using the user's ID and a timestamp to prevent conflicts.
        const filePath = `${userid}/${Date.now()}_${safeName}`;

        // Upload the file buffer to the specified path in Supabase storage.
        const { error: uploadError } = await supabase
            .storage
            .from(BUCKET)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            return res.status(500).json({ error: "Hiba a fájl tárolásakor", details: uploadError.message });
        }

        return res.status(200).json({
            message: "Sikeres feltöltés",
            filePath,
        });

    } catch (err) {
        const e = err instanceof Error ? err.message : "Ismeretlen hiba";
        return res.status(500).json({ error: e });
    }
});


// delete resume endpoint fix!!!
router.delete("/delete-resume", verifyToken, async (req: AuthRequest, res) => {
    try {
        const BUCKET = "resumes";
        const userId = req.userId!;

        // List all files in the user's resume folder
        const { data: files, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${userId}/`);

        if (listError) {
            console.error("Storage list error:", listError);
            return res.status(500).json({ error: "Failed to list files." });
        }

        if (!files || files.length === 0) {
            return res.status(404).json({ error: "No uploaded resume found." });
        }

        // Filter out empty or invalid files
        const realFiles = files.filter(f => f.metadata && f.metadata.size > 0);

        if (realFiles.length === 0) {
            return res.status(404).json({ error: "No removable resume found." });
        }

        // Build full storage paths for deletion
        const filePaths = realFiles.map(file => `${userId}/${file.name}`);

        // Remove files from storage
        const { error: removeError } = await supabase
            .storage
            .from(BUCKET)
            .remove(filePaths);

        if (removeError) {
            console.error("Storage remove error:", removeError);
            return res.status(500).json({ error: "Failed to delete resume." });
        }

        return res.json({ success: true, message: "Resume deleted successfully." });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
