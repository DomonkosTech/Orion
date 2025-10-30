import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import type { CookieOptions } from "express";

//import secret keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
console.log("Encryption key loaded:", ENCRYPTION_KEY);
console.log("JWT secret loaded:", JWT_SECRET);

// Initialize Supabase client
import { supabase } from "./supabaseClient";

// Initialize Express app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));






// Login endpoint
app.post("/api/user-login", async (req, res) => {
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

    // Token élettartam
    const expiresIn = rememberMe ? "7d" : "15m";
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });

    // Cookie beállítása
    const cookieOptions: CookieOptions = {
        httpOnly: true,
        secure: false,//process.env.NODE_ENV === "production"
        sameSite: "strict" as const
    };

    if (rememberMe) {
        // 1 hétig élő cookie
        console.log("Remember me enabled");
        cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 1 hét
    }

    // ha rememberMe === false -> nem adunk meg maxAge-et => session cookie lesz

    res.cookie("auth_token", token, cookieOptions);
    res.json({ success: true, message: "Login successful" });
});





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


app.get("/api/get-user-info", async (req, res) => {
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

        if (decryptError) throw decryptError;
        console.log("Decrypted documents:", documents);
        // 🔹 Válasz összeállítása
        res.json({
            success: true,
            user,
            documents: documents,
        });

    } catch (err) {
        console.error("get-user-info error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});

app.post("/api/update-user-info", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ error: "Missing token" });
    if (!JWT_SECRET) return res.status(500).json({ error: "JWT secret not configured" });

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        const user_id = decoded.userId;

        const data = req.body;
        const documents = data.documents;

        // Update users táblát
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

        // Update dokumentumok
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










// User info endpoint
app.get("/api/user-info", async (req, res) => {
    const token = req.cookies.auth_token;
    if (!token)
        return res.status(401).json({ error: "Missing token" });

    if (!JWT_SECRET) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, decoded });
    } catch (err) {
        console.error("JWT verify error:", err);
        res.status(401).json({ error: "Invalid or expired token" });
    }
});




app.post("/api/register", async (req, res) => {
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

app.post("/api/register/credentials", async (req, res) => {
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

app.post("/api/register/documents", async (req, res) => {
    const { user_id, personal_id, address_card_number } = req.body;
    if (!user_id || !personal_id || !address_card_number) {
        return res.status(400).json({ error: "personal_id and address_card_number are required" });
    }

    if (!ENCRYPTION_KEY) {
        return res.status(500).json({ error: "Encryption key not configured" });
    }

    try {
        // Use rvaw SQL query with pgp_sym_encrypt
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


// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));