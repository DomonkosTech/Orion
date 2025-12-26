import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import type { CookieOptions, Request, Response, NextFunction } from "express";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }// max 5 MB limit
});


//import secret keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
console.log("Encryption key loaded:", ENCRYPTION_KEY);
console.log("JWT secret loaded:", JWT_SECRET);

// Initialize Supabase client
import { supabase } from "../lib/supabaseClient.ts";

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));


///////////////////////////////////////////////////
//              MIDDLEWARE FUNCTIONS             //
///////////////////////////////////////////////////

// Extend Express Request type to include user/company data
interface AuthRequest extends Request {
    userId?: number;
    companyId?: number;
    userType?: 'user' | 'company';
}

// Middleware: Verify JWT token
const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.auth_token;

    if (!token) {
        return res.status(401).json({ error: "Missing token" });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId?: number;
            companyId?: number;
            userType: 'user' | 'company'
        };

        req.userId = decoded.userId;
        req.companyId = decoded.companyId;
        req.userType = decoded.userType;

        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// Middleware: Verify user exists in database
const verifyUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId) {
        return res.status(401).json({ error: "User ID not found in token" });
    }

    try {
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", req.userId)
            .maybeSingle();

        if (!user) {
            return res.status(403).json({ error: "Please login" });
        }

        next();
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Middleware: Verify company exists in database
const verifyCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.companyId) {
        return res.status(401).json({ error: "Company ID not found in token" });
    }

    try {
        const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("id", req.companyId)
            .maybeSingle();

        if (!company) {
            return res.status(403).json({ error: "Please login" });
        }

        next();
    } catch {
        return res.status(500).json({ error: "Internal server error" });
    }
};



///////////////////////////////////////////////////
//          user login and register              //
///////////////////////////////////////////////////


// user Login endpoint fix!!!
app.post("/api/user/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Basic request validation
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        interface data {
            id: number;
            user_credentials: {
                password_hash: string;
            };
        }

        // Fetch user and password hash (joined query for performance)
        const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("id, user_credentials(password_hash)")
            .eq("email", email)
            .maybeSingle<data>();

        if (fetchError) throw fetchError;

        // If user not found or no stored password hash → invalid login
        if (!userData || !userData.user_credentials || userData.user_credentials.password_hash.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordHash = userData.user_credentials.password_hash;

        // Compare provided password with stored hash
        const match = await bcrypt.compare(password, passwordHash);

        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Ensure server JWT secret is configured
        if (!JWT_SECRET) {
            console.error("Critical error: JWT secret not configured.");
            return res.status(500).json({ error: "Internal server configuration error" });
        }

        // Generate JWT (short or long expiry based on rememberMe)
        const expiresIn = rememberMe ? "7d" : "15m";
        const token = jwt.sign({ userId: userData.id, userType: 'user' }, JWT_SECRET, { expiresIn });

        // Secure auth cookie settings
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: false, // set to true in production
            sameSite: "strict" as const
        };

        // Extend cookie lifetime if "remember me" is enabled
        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
        }

        // Send cookie + success response
        res.cookie("auth_token", token, cookieOptions);
        res.json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error("Error during login processing:", error);
        return res.status(500).json({ error: "Internal server error during login processing" });
    }
});


//user register endpoint fix!!!
app.post("/api/user/register", async (req, res) => {
    try {
        const {
            email, password, lname, fname, phone_number,
            birth_place, birth_date, address, nationality,
            short_bio, qualifications, tax_number,
            personal_id, address_card_number, terms_accepted
        } = req.body;

        // basic request validation
        if (!email || !password || !terms_accepted) {
            return res.status(400).json({ error: "Email, password and terms required" });
        }

        if (!personal_id || !address_card_number) {
            return res.status(400).json({ error: "Personal ID and address card required" });
        }

        //check if encryption key is configured
        if (!ENCRYPTION_KEY) {
            return res.status(500).json({ error: "Server config error" });
        }

        // hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Call RPC to insert user securely
        const {error} = await supabase.rpc('register_user_v1', {
            p_email: email,
            p_password_hash: password_hash,
            p_lname: lname,
            p_fname: fname,
            p_phone_number: phone_number,
            p_birth_place: birth_place,
            p_birth_date: birth_date,
            p_address: address,
            p_nationality: nationality,
            p_short_bio: short_bio,
            p_qualifications: qualifications,
            p_tax_number: tax_number,
            p_terms_accepted: terms_accepted,
            p_personal_id: personal_id,
            p_address_card_number: address_card_number,
            p_encryption_key: ENCRYPTION_KEY
        });

        if (error) {
            console.error("RPC error:", error);
            return res.status(400).json({ error: "Registration failed" });
        }

        // send success response
        res.json({
            success: true,
            message: "Registration successful"
        });

    } catch {
        res.status(500).json({ error: "Unexpected server error" });
    }
});


// user get info: user profile, decrypted documents, and resume status fix!!!
app.get("/api/user/profile", verifyToken, async (req: AuthRequest, res) => {
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
app.patch("/api/user/profile", verifyToken, async (req: AuthRequest, res) => {
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
app.post("/api/upload-resume", verifyToken, upload.single("resume"), async (req: AuthRequest, res) => {
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
app.delete("/api/delete-resume", verifyToken, async (req: AuthRequest, res) => {
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



///////////////////////////////////////////////////
//         company login and register            //
///////////////////////////////////////////////////


//company login endpoint fix!!!
app.post("/api/company/login", async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        // Basic request validation
        if (!email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        interface data {
            id: number;
            company_credentials: {
                password_hash: string;
            };
        }

        // Fetch company and password hash (joined query for performance)
        const { data: companyData, error: fetchError } = await supabase
            .from("companies")
            .select("id, company_credentials(password_hash)")
            .eq("email", email)
            .maybeSingle<data>();

        if (fetchError) throw fetchError;

        // If company not found or no stored password hash → invalid login
        if (!companyData || !companyData.company_credentials || companyData.company_credentials.password_hash.length === 0){
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const passwordHash = companyData.company_credentials.password_hash

        // Compare provided password with stored hash
        const match = await bcrypt.compare(password, passwordHash);

        if (!match) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Ensure server JWT secret is configured
        if (!JWT_SECRET) {
            console.error("Critical error: JWT secret not configured.");
            return res.status(500).json({ error: "Internal server configuration error" });
        }

        // Generate JWT (short or long expiry based on rememberMe)
        const expiresIn = rememberMe ? "7d" : "15m";
        const token = jwt.sign({ companyId: companyData.id, userType: 'company' }, JWT_SECRET, { expiresIn });

        // Secure auth cookie settings
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: false,//process.env.NODE_ENV === "production"
            sameSite: "strict" as const
        };


        // Extend cookie lifetime if "remember me" is enabled
        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 week
        }

        // Send cookie + success response
        res.cookie("auth_token", token, cookieOptions);
        res.json({ success: true, message: "Login successful" });
    }
    catch (error) {
        console.error("Error during login processing:", error);
        return res.status(500).json({ error: "Internal server error during login processing" });
    }
});

//register endpoint fix!!!
app.post("/api/company/register", async (req, res) => {
    try {
        const { email, password,  name, address, tax_number, contact_person_name, activity_scope, website, short_description, phone_number, terms_accepted } = req.body;

        // basic request validation
        if (!email || !terms_accepted || !password) {
            return res.status(400).json({ error: "Email, password and terms required" });
        }

        // hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Call RPC to insert company securely
        const { error } = await supabase.rpc('register_company_v1',
            {
                p_email: email,
                p_password_hash: password_hash,
                p_name: name,
                p_address: address,
                p_tax_number: tax_number,
                p_contact_person_name: contact_person_name,
                p_activity_scope: activity_scope,
                p_website: website,
                p_short_description: short_description,
                p_terms_accepted: terms_accepted,
                p_phone_number: phone_number,
            });


        if (error) {
            console.error("RPC error:", error);
            return res.status(400).json({ error: "Registration failed" });
        }

        // Send success response
        res.json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Unexpected server error" });
    }
});


// company get info: user profile fix!!!
app.get("/api/company/profile", verifyToken, async (req: AuthRequest, res) => {
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
app.patch("/api/company/profile", verifyToken, async (req: AuthRequest, res) => {
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




///////////////////////////////////////////////////
//                 advertisment                  //
///////////////////////////////////////////////////

// Create advertisement endpoint fix!!!
app.post("/api/advertisements", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        const { title, position, location, hourly_wage, tasks, requirements, is_active, job_description } = req.body;

        // Required fields check
        if (!title || !position || !location || !job_description) {
            return res.status(400).json({ error: "Please fill in all required fields." });
        }

        // Hourly wage validation
        if (hourly_wage && hourly_wage < 0) {
            return res.status(400).json({ error: "Hourly wage cannot be negative." });
        }

        // Count existing advertisements for the company
        const { count, error: counterror } = await supabase
            .from("advertisement")
            .select("*", { count: "exact", head: true })
            .eq("company_id", companyId);

        if (counterror) throw counterror;

        // Max advertisement limit check
        if (count! >= 3) {
            return res.status(400).json({
                error: "You have reached the maximum limit of 3 advertisements. Please delete one to create a new one."
            });
        }

        // Insert new advertisement
        const { data: advertisement, error } = await supabase
            .from("advertisement")
            .insert([
                {
                    title,
                    position,
                    location,
                    hourly_wage,
                    tasks,
                    requirements,
                    is_active: is_active ?? true,
                    company_id: companyId,
                    job_description,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, advertisement });
    } catch (error) {
        console.error("Advertisement creation error:", error); // Log server-side error
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get advertisements by company id endpoint fix!!!
app.get("/api/company/advertisements", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const companyId = req.companyId;

    try {
        // Fetch advertisements by company ID, ordered by creation date in descending order
        const { data, error } = await supabase
            .from("advertisement")
            .select("id, title, position, is_active")
            .eq("company_id", companyId)
            .order("id", { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            advertisements: data
        });

    } catch (error) {
        console.error("Advertisement fetch error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// get advertisment info endpoint fix!!!
app.get("/api/advertisement/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
        // Fetch advertisement by ID
        const { data: advertisement, error } = await supabase
            .from("advertisement")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

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


// get advertisment info endpoint by user fix!!!
app.get("/api/advertisements/:id", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
        // Fetch advertisement by ID
        const { data: advertisement, error } = await supabase
            .from("advertisement")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

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
app.patch("/api/advertisements/:id", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const data = req.body;
    const id = req.params.id;
    const companyId = req.companyId;

    try {

        const { data: updatedadvertisement, error: advertisementError } = await supabase
            .from("advertisement")
            .update({
                title: data.title,
                position: data.position,
                location: data.location,
                hourly_wage: data.hourly_wage,
                tasks: data.tasks,
                requirements: data.requirements,
                job_description: data.job_description,
            })
            .eq("id", id)
            .eq("company_id", companyId)
            .select()
            .single();

        if (advertisementError) throw advertisementError;

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
app.get("/api/advertisements", verifyToken, verifyUser, async (_req, res) => {
    try {

        // Fetch all active advertisements ordered by creation date in descending order
        const { data: advertisements, error } = await supabase
            .from("advertisement")
            .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")
            .eq('is_active', true)
            .order("created_at", { ascending: false });
        if (error) throw error;

        res.json({
            success: true,
            advertisements,
        });

    } catch (err) {
        console.error("get-advertisements-info error:", err);
        res.status(500).json({ error: "Internal Server Error " });
    }
});


//submit application endpoint fix!!!
app.post("/api/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {

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
app.get("/api/user/applications", verifyToken, verifyUser, async (req: AuthRequest, res) => {
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
app.get("/api/advertisements/:id/applicants", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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
app.post("/api/applications/:id/reject", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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
app.get("/api/applications/:id/resume", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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
app.post("/api/applications/:id/accept", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
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




///////////////////////////////////////////////////
//           logout and check auth               //
///////////////////////////////////////////////////


// Logout endpoint
app.post("/api/logout", (_req, res) => {
    try {
        // A 'auth_token' cookie törlése
        res.clearCookie("auth_token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.json({ success: true, message: "Sikeres kijelentkezés" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Kijelentkezés sikertelen" });
    }
});


// Check auth endpoint
app.get("/auth/check", (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.json({ loggedIn: false });

    try {
        const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
        return res.json({
            loggedIn: true,
            user: decoded,
            userType: decoded.userType
        });
    } catch {
        return res.json({ loggedIn: false });
    }
});




// ... existing code ...


// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));