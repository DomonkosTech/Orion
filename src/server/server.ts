import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import type { CookieOptions } from "express";
import multer from "multer";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // opcionális (5 MB limit)
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
//          user login and register              //
///////////////////////////////////////////////////


//login endpoint
app.post("/api/user/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Missing fields" });

    const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (!user)
        return res.status(404).json({ error: "No user found" });

    const { data: credentials } = await supabase
        .from("user_credentials")
        .select("password_hash")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!credentials)
        return res.status(404).json({ error: "No password set" });

    const match = await bcrypt.compare(password, credentials.password_hash);
    if (!match)
        return res.status(401).json({ error: "Invalid password" });

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    const expiresIn = rememberMe ? "7d" : "15m";
    const token = jwt.sign({ userId: user.id, userType: 'user' }, JWT_SECRET, { expiresIn }, );

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: false,//process.env.NODE_ENV === "production"
        sameSite: "strict" as const
    };

    if (rememberMe) {
        console.log("Remember me enabled");
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 hét
    }

    res.cookie("auth_token", token, cookieOptions);
    res.json({ success: true, message: "Login successful" });
});


//get user info endpoint
app.get("/api/user/getinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    if (!ENCRYPTION_KEY)
        return res.status(500).json({ error: "Encryption key not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const user_id = decoded.userId;

        const { data: user, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", user_id)
            .single();

        if (userError) throw userError;

        const { data: documents, error: decryptError } = await supabase.rpc(
            "get_decrypted_documents",
            {
                p_user_id: user_id,
                p_encryption_key: ENCRYPTION_KEY,
            }
        );

        const BUCKET = "resumes";

        // --- CHECK IF USER ALREADY HAS A REAL FILE ---
        const { data: existingFiles, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${user_id}/`);

        if (listError) {
            console.error("Storage list error:", listError);
            return res.status(500).json({ error: "Hiba a mappa ellenőrzésekor" });
        }

        const realFiles = (existingFiles || []).filter(f => f.metadata && f.metadata.size > 0);

        let resume: boolean;
        if (realFiles.length > 0) {
            resume = true;
        }
        else
        {
            resume = false;
        }


        if (decryptError) throw decryptError;
        console.log("Decrypted documents:", documents);
        // 🔹 Válasz összeállítása
        res.json({
            success: true,
            user,
            documents: documents,
            resume: resume
        });

    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
});


//update user info endpoint
app.post("/api/user/updateinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user_id = decoded.userId;

        const data = req.body;
        const documents = data.documents;

        const { data: updatedUser, error: userError } = await supabase
            .from("users")
            .update({
                email: data.email,
                phone_number: data.phone_number,
                birth_place: data.birth_place,
                birth_date: data.birth_date,
                address: data.address,
                tax_number: data.tax_number,
                nationality: data.nationality,
                short_bio: data.short_bio,
                qualifications: data.qualifications
            })
            .eq("id", user_id)
            .select()
            .single();

        if (userError) throw userError;

        if (documents) {
            if (!ENCRYPTION_KEY) return res.status(500).json({ error: "Encryption key not configured" });

            const { error: docError } = await supabase.rpc("update_encrypted_documents", {
                p_user_id: user_id,
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

    } catch (err) {
        console.error("Update user info error:", err);
        res.status(500).json({ error: "Update failed" });
    }
});


// register endpoint
app.post("/api/user/register", async (req, res) => {
    const { email, phone_number, birth_place, birth_date, address, tax_number, nationality, terms_accepted, short_bio, qualifications } = req.body;

    if (!email || !terms_accepted) {
        return res.status(400).json({ error: "Email and terms acceptance are required" });
    }

    try {
        const { data: user, error } = await supabase
            .from("users")
            .insert([
                {
                    email,
                    phone_number,
                    birth_place,
                    birth_date,
                    address,
                    tax_number,
                    nationality,
                    terms_accepted,
                    short_bio,
                    qualifications,
                    activated: true,
                    join_date: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) throw error;
        res.json({ success: true, userId: user.id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Registration failed" });
    }
});


// register credentials endpoint
app.post("/api/user/register/credentials", async (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({ error: "User ID and password are required" });
    }

    try {
        const password_hash = await bcrypt.hash(password, 12);

        const { error } = await supabase
            .from("user_credentials")
            .insert([{ user_id, password_hash }]);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Password setup failed" });
    }
});


// register documents endpoint
app.post("/api/user/register/documents", async (req, res) => {
    const { user_id, personal_id, address_card_number } = req.body;
    if (!user_id || !personal_id || !address_card_number) {
        return res.status(400).json({ error: "personal_id and address_card_number are required" });
    }

    if (!ENCRYPTION_KEY) {
        return res.status(500).json({ error: "Encryption key not configured" });
    }

    try {
        const { error } = await supabase.rpc('insert_encrypted_documents', {
            p_user_id: user_id,
            p_personal_id: personal_id,
            p_address_card_number: address_card_number,
            p_encryption_key: ENCRYPTION_KEY
        });

        if (error) throw error;
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "user documents setup failed" });
    }
})


// upload resume endpoint
app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        // --- JWT DECODE ---
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number };
        const uid = decoded.userId;

        // --- FILE VALIDATION ---
        const file = req.file;
        if (!file) return res.status(400).json({ error: "Nincs fájl kiválasztva." });

        const BUCKET = "resumes";

        // --- CHECK IF USER ALREADY HAS A REAL FILE ---
        const { data: existingFiles, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${uid}/`);

        if (listError) {
            console.error("Storage list error:", listError);
            return res.status(500).json({ error: "Hiba a mappa ellenőrzésekor" });
        }

        const realFiles = (existingFiles || []).filter(f => f.metadata && f.metadata.size > 0);

        if (realFiles.length > 0) {
            return res.status(400).json({ error: "Már töltöttél fel önéletrajzot. Csak egy fájl engedélyezett." });
        }

        // --- SAFE FILE NAME ---
        const safeName = file.originalname
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9._-]/g, "");

        // --- FINAL FILE PATH ---
        const filePath = `${uid}/${Date.now()}_${safeName}`;

        // --- UPLOAD FILE ---
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


// delete resume endpoint
app.delete("/api/delete-resume", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const userId = decoded.userId;
        const BUCKET = "resumes";

        // --- LIST FILES ---
        const { data: files, error: listError } = await supabase
            .storage
            .from(BUCKET)
            .list(`${userId}/`);

        if (listError) {
            console.error("Storage list error:", listError);
            return res.status(500).json({ error: "Hiba a fájlok listázásakor." });
        }

        if (!files || files.length === 0) {
            return res.status(404).json({ error: "Nincs feltöltött önéletrajz." });
        }

        // --- ONLY REAL FILES (metadata exists + size > 0) ---
        const realFiles = files.filter(f => f.metadata && f.metadata.size > 0);

        if (realFiles.length === 0) {
            return res.status(404).json({ error: "Nincs eltávolítható önéletrajz." });
        }

        // --- BUILD PATHS ---
        const filePaths = realFiles.map(file => `${userId}/${file.name}`);

        // --- DELETE ONLY FILES ---
        const { error: removeError } = await supabase
            .storage
            .from(BUCKET)
            .remove(filePaths);

        if (removeError) {
            console.error("Storage remove error:", removeError);
            return res.status(500).json({ error: "Hiba az önéletrajz törlésekor." });
        }

        return res.json({ success: true, message: "Önéletrajz sikeresen törölve." });

    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token", err });
    }
});



///////////////////////////////////////////////////
//         company login and register            //
///////////////////////////////////////////////////


//login endpoint
app.post("/api/company/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: "Missing fields" });

    const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("email", email)
        .maybeSingle();

    if (!company)
        return res.status(404).json({ error: "No user found" });

    const { data: credentials } = await supabase
        .from("company_credentials")
        .select("password_hash")
        .eq("company_id", company.id)
        .maybeSingle();

    if (!credentials)
        return res.status(404).json({ error: "No password set" });

    const match = await bcrypt.compare(password, credentials.password_hash);
    if (!match)
        return res.status(401).json({ error: "Invalid password" });

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    const expiresIn = rememberMe ? "7d" : "15m";
    const token = jwt.sign({ companyId: company.id, userType: 'company' }, JWT_SECRET, { expiresIn });

    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: false,//process.env.NODE_ENV === "production"
        sameSite: "strict" as const
    };

    if (rememberMe) {
        console.log("Remember me enabled");
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 hét
    }

    res.cookie("auth_token", token, cookieOptions);
    res.json({ success: true, message: "Login successful" });
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
app.get("/api/company/getinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", company_id)
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
app.post("/api/company/updateinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string };
        const company_id = decoded.companyId;

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
            .eq("id", company_id)
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
app.post("/api/addadvertisment/create", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "Nincs bejelentkezve, próbálja újra!" });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    try {
        // JWT token dekódolása a company_id megszerzéséhez
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;
        const { count} = await supabase
            .from("advertisement")
            .select("*", { count: "exact", head: true })
            .eq("company_id", company_id);
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
                    company_id,
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

// get advertisments by company id endpoint
app.get("/api/advertisements/by-company", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ error: "Nincs bejelentkezve, próbálja újra!" });
    }

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data, error } = await supabase
            .from("advertisement")
            .select("id, title, position")
            .eq("company_id", company_id)
            .order("id", { ascending: true });

        if (error) throw error;

        res.json({
            success: true,
            advertisements: data
        });

    } catch (error) {
        console.error("Advertisement fetch error:", error);
        res.status(500).json({ error: "Hirdetések lekérdezése sikertelen" });
    }
});


// get advertisment info endpoint
app.post("/api/addadvertisment/getinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    const { id } = req.body;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data: advertisement, error: companyError } = await supabase
            .from("advertisement")
            .select("*")
            .eq("id", id)
            .eq("company_id", company_id)
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




app.post("/api/addadvertisment/user/getinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    const { id } = req.body;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const uid = decoded.userId;
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", uid)
            .maybeSingle();
        if (user == null) return res.status(403).json({ error: "please login" });

        const { data: advertisement, error: companyError } = await supabase
            .from("advertisement")
            .select("*")
            .eq("id", id)
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


//update advertisment info endpoint
app.post("/api/advertisement/updateinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: string };
        const company_id = decoded.companyId;

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
            .eq("company_id", company_id)
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



//get all advertisments
app.get("/api/addadvertisment/getall", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const id = decoded.userId;
        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", id)
            .maybeSingle();
        if (user == null) return res.status(403).json({ error: "please login" });

        const { data: advertisement, error: companyError } = await supabase
            .from("advertisement")
            .select("id,title,position,location,hourly_wage,tasks,requirements,job_description")

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


//submit application endpoint
app.post("/api/addadvertisment/submitApplication", async (req, res) => {
    const token = req.cookies.auth_token;
    const { id } = req.body;

    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const uid = decoded.userId;

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", uid)
            .maybeSingle();

        if (!user)
            return res.status(403).json({ error: "please login" });

        const { data: application } = await supabase
            .from("job_applications")
            .select("id")
            .eq("user_id", uid)
            .eq("advertisement_id", id)
            .maybeSingle();

        if (application)
            return res.status(409).json({ error: "már jelentkeztél erre a munkára" });

        const { error: insertError } = await supabase
            .from("job_applications")
            .insert([
                {
                    user_id: uid,
                    advertisement_id: id,
                    last_updated: new Date().toISOString()
                }
            ]);

        if (insertError) throw insertError;

        return res.json({ success: true });

    } catch (err) {
        console.error("submitApplication error:", err);

        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }

});



app.post("/api/addadvertisment/getallsubmit", async (req, res) => {
    const token = req.cookies.auth_token;

    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        const uid = decoded.userId;

        const { data: user } = await supabase
            .from("users")
            .select("id")
            .eq("id", uid)
            .maybeSingle();

        if (!user)
            return res.status(403).json({ error: "please login" });

        const { data: submit} = await supabase
            .from("job_applications")
            .select("id, status, last_updated, advertisement_id, advertisment:advertisement(title)")
            .eq("user_id", uid)
        const { data: work} = await supabase
            .from("employees")
            .select("id, position, job_title, hourly_wage, hire_date, company:companies(name)")
            .eq("user_id", uid)

        console.log(work);
        if (submit == null && work == null) return res.status(403).json({ error: "no data found" });
        res.json({
            success: true,
            submit,
            work,
        });
    }
    catch (err) {
            console.error("submitApplication error:", err);

            if (err instanceof jwt.JsonWebTokenError) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }

            return res.status(500).json({ error: "Internal server error" });
    }
});


//Applicant tracking endpointa
app.post("/api/ATS/getinfo", async (req, res) => {
    const token = req.cookies.auth_token;
    const { id } = req.body;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("id", company_id)
            .maybeSingle();

        if (!company)
            return res.status(403).json({ error: "please login" });

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
                    qualifications
                    
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
app.post("/api/ATS/reject_application", async (req, res) => {

    const token = req.cookies.auth_token;
    const { id } = req.body;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("id", company_id)
            .maybeSingle();

        if (!company)
            return res.status(403).json({ error: "please login" });

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


//accept application endpoint
app.post("/api/ATS/accept_application", async (req, res) => {
    const token = req.cookies.auth_token;
    const { id } = req.body;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET)
        return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { companyId: number };
        const company_id = decoded.companyId;

        const { data: company } = await supabase
            .from("companies")
            .select("id")
            .eq("id", company_id)
            .maybeSingle();

        if (!company)
            return res.status(403).json({ error: "please login" });


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