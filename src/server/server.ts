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


//register endpoint
app.post("/api/company/register", async (req, res) => {
    const { email,  name, address, tax_number, contact_person_name, activity_scope, website, short_description, phone_number, terms_accepted } = req.body;
    if (!email || !terms_accepted) {
        return res.status(400).json({ error: "Email and terms acceptance are required" });
    }
    try {
        const { data: company, error } = await supabase
            .from("companies")
            .insert([
                {
                    email,
                    name,
                    address,
                    tax_number,
                    contact_person_name,
                    activity_scope,
                    website,
                    short_description,
                    terms_accepted,
                    verified: true,
                    join_date: new Date().toISOString(),
                    phone_number,
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, companyId: company.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
})


//register credentials endpoint
app.post("/api/company/register/credentials", async (req, res) => {
    const { company_id, password } = req.body;

    if (!company_id || !password) {
        return res.status(400).json({ error: "Company ID and password are required" });
    }

    try {
        const password_hash = await bcrypt.hash(password, 12);

        const { error } = await supabase
            .from("company_credentials")
            .insert([{ company_id, password_hash }]);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Password setup failed" });
    }
});


//get company info endpoint
app.get("/api/company/getinfo", verifyToken, async (req: AuthRequest, res) => {
    try {
        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", req.companyId!)
            .single();

        if (companyError) throw companyError;

        res.json({
            success: true,
            company,
        });

    } catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});


//update company info endpoint
app.post("/api/company/updateinfo", verifyToken, async (req: AuthRequest, res) => {
    try {
        const data = req.body;

        const { data: updatedCompany, error: companyError } = await supabase
            .from("companies")
            .update({
                email: data.email,
                name: data.name,
                phone_number: data.phone_number,
                address: data.address,
                tax_number: data.tax_number,
                contact_person_name: data.contact_person_name,
                activity_scope: data.activity_scope,
                website: data.website,
                short_description: data.short_description
            })
            .eq("id", req.companyId!)
            .select()
            .single();

        if (companyError) throw companyError;

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

// create advertisment endpoint
app.post("/api/addadvertisment/create", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const { count} = await supabase
            .from("advertisement")
            .select("*", { count: "exact", head: true })
            .eq("company_id", req.companyId!);
        if (count! >= 3) {
            return res.status(400).json({ error: "Elérted a maximum 3 hirdetés limitet, törölj egyet az új létrehozásához." });
        }

        const { title, position, location, hourly_wage, tasks, requirements, is_active, search_start, job_description } = req.body;

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
                    is_active,
                    search_start,
                    company_id: req.companyId!,
                    job_description,
                }
            ])
            .select()
            .single();

        if (error) throw error;

        res.json({ success: true, advertisement });
    } catch (error) {
        console.error("Advertisement creation error:", error);
        res.status(500).json({ error: "Hirdetés létrehozása sikertelen" });
    }
});

// get advertisements by company id endpoint
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


// get advertisment info endpoint
app.post("/api/addadvertisment/getinfo", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.body;

    try {
        const { data: advertisement, error: companyError } = await supabase
            .from("advertisement")
            .select("*")
            .eq("id", id)
            .eq("company_id", req.companyId!)
            .single();

        if (companyError) throw companyError;

        res.json({
            success: true,
            advertisement,
        });

    } catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
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

    } catch {
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//update advertisment info endpoint
app.post("/api/advertisement/updateinfo", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    try {
        const data = req.body;
        const id = data.id;

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
            .eq("company_id", req.companyId!)
            .select()
            .single();

        if (advertisementError) throw advertisementError;

        res.json({
            success: true,
            company: updatedadvertisement
        });

    } catch (err) {
        console.error("Update advertisement info error:", err);
        res.status(500).json({ error: "Update failed" });
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



app.post("/api/addadvertisment/getallsubmit", verifyToken, verifyUser, async (req: AuthRequest, res) => {
    try {
        const userid = req.userId;

        //get all submitted applications
        const { data: submit} = await supabase
            .from("job_applications")
            .select("id, status, last_updated, advertisement_id, advertisment:advertisement(title)")
            .eq("user_id", userid)

        //get all work
        const { data: work} = await supabase
            .from("employees")
            .select("id, position, job_title, hourly_wage, hire_date, company:companies(name)")
            .eq("user_id", userid)

        if ((!submit || submit.length === 0) && (!work || work.length === 0))
            return res.status(404).json({ error: "no data found" });

        res.json({
            success: true,
            submit,
            work,
        });
    }
    catch (err) {
        console.error("submitApplication error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


//Applicant tracking endpointa
app.post("/api/ATS/getinfo", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.body;

    try {
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
            .eq("advertisement_id", id)
            .eq("status", "submitted");


        if (error) throw error;

        res.json({
            success: true,
            applicants,
        });

    } catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});


//reject application endpoint
app.post("/api/ATS/reject_application", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.body;

    try {
        const { error } = await supabase
            .from("job_applications")
            .update({
                status: "rejected"
            })
            .eq("id", id)
            .maybeSingle();

        if (error) throw error;

        res.json({success: true});

    } catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }

})


//download resume endpoint
app.post("/api/ATS/download_resume", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.body;

    try {
        interface ApplicantData {
            user_id: number;
            advertisement_id: {
                company_id: number;
            };
        }


        const { data: applicant } = await supabase
            .from("job_applications")
            .select("user_id, advertisement_id( company_id )")
            .eq("id", id)
            .maybeSingle<ApplicantData>();
        if (applicant?.advertisement_id.company_id !== req.companyId!)
            return res.status(403).json({ error: "nincs jogod lekérni" });

        const userId = applicant.user_id;
        const BUCKET = "resumes";
        const { data: files, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${userId}/`);

        if (listError) throw listError;
        const resumeFile = files.find(f => f.metadata && f.metadata.size > 0);

        if (!resumeFile) {
            return res.status(404).json({ success: false, message: "Nincs feltöltött önéletrajz." });
        }
        const filePath = `${userId}/${resumeFile.name}`;

        // Generate a signed URL valid for 60 minutes (3600 seconds)
        const { data, error: urlError } = await supabase
            .storage
            .from(BUCKET)
            .createSignedUrl(filePath, 3600);

        if (urlError) throw urlError;

        res.json({ success: true, url: data.signedUrl });
    }

    catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});


//accept application endpoint
app.post("/api/ATS/accept_application", verifyToken, verifyCompany, async (req: AuthRequest, res) => {
    const { id } = req.body;

    try {
        interface Advertisement {
            company_id: number;
            position: string;
            title: string;
            hourly_wage: number;
        }

        interface User {
            id: number;
        }

        interface ApplicantResult {
            id: number;
            last_updated: string;
            advertisement: Advertisement;
            users: User;
        }

        const { data: applicants, error } = await supabase
            .from("job_applications")
            .select(`
        id,
        last_updated,
        advertisement:advertisement_id (
            company_id,
            position,
            title,
            hourly_wage
        ),
        users:user_id (
            id
        )
    `)
            .eq("id", id)
            .maybeSingle<ApplicantResult>();


        if (!applicants || !applicants.users || !applicants.advertisement)
            return res.status(403).json({ error: "please login" });




        const adat = applicants.users;
        const adat2 = applicants.advertisement;


        const { error: erro } = await supabase
            .from("employees")
            .insert([
                {
                    user_id: adat.id,
                    company_id: adat2.company_id,
                    position: adat2.position,
                    job_title: adat2.title,
                    hourly_wage: adat2.hourly_wage,
                }
            ]);

        const { error: er } = await supabase
            .from("job_applications")
            .delete()
            .eq("id", id)

        if (error) throw error;
        if (erro) throw erro;
        if (er) throw er;


        res.json({
            success: true,

        });

    } catch (err) {
        console.error("get-company-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
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