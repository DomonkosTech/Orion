import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { CookieOptions } from "express";
import { supabase } from "../../lib/supabaseClient.ts";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

// user Login endpoint fix!!!
router.post("/user/login", async (req, res) => {
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
router.post("/user/register", async (req, res) => {
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


//company login endpoint fix!!!
router.post("/company/login", async (req, res) => {
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
router.post("/company/register", async (req, res) => {
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


// Logout endpoint
router.post("/logout", (_req, res) => {
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
router.get("/auth/status", (req, res) => {
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

export default router;
