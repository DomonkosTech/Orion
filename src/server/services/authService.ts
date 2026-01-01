import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase } from "../../lib/supabaseClient.ts";
import dotenv from "dotenv";
import type { CookieOptions } from "express";

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

interface UserRegistrationData {
    email: string;
    password: string;
    lname: string;
    fname: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
    tax_number: string;
    personal_id: string;
    address_card_number: string;
    terms_accepted: boolean;
}

interface CompanyRegistrationData {
    email: string;
    password: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website?: string;
    short_description: string;
    phone_number: string;
    terms_accepted: boolean;
}

export const authService = {
    async loginUser(email: string, password: string, rememberMe: boolean) {
        // Validate input
        if (!email || !password) {
            throw { status: 400, message: "Missing required fields" };
        }

        interface data {
            id: number;
            user_credentials: {
                password_hash: string;
            };
        }

        // Fetch user data
        const { data: userData, error: fetchError } = await supabase
            .from("users")
            .select("id, user_credentials(password_hash)")
            .eq("email", email)
            .maybeSingle<data>();

        if (fetchError) throw fetchError;

        // Check if user exists and has password
        if (!userData || !userData.user_credentials || userData.user_credentials.password_hash.length === 0) {
            throw { status: 401, message: "Invalid credentials" };
        }

        const passwordHash = userData.user_credentials.password_hash;

        // Compare provided password with stored hash
        const match = await bcrypt.compare(password, passwordHash);

        if (!match) {
            throw { status: 401, message: "Invalid credentials" };
        }

        // Check server config
        if (!JWT_SECRET) {
            console.error("Critical error: JWT secret not configured.");
            throw { status: 500, message: "Internal server configuration error" };
        }

        // Generate JWT token
        const expiresIn = rememberMe ? "7d" : "15m";
        const token = jwt.sign({ userId: userData.id, userType: 'user' }, JWT_SECRET, { expiresIn });

        // Set cookie options
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: false, // set to true in production
            sameSite: "strict" as const
        };

        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
        }

        return { token, cookieOptions };
    },

    async registerUser(data: UserRegistrationData) {
        const {
            email, password, lname, fname, phone_number,
            birth_place, birth_date, address, nationality,
            short_bio, qualifications, tax_number,
            personal_id, address_card_number, terms_accepted
        } = data;

        // Validate required fields
        if (!email || !password || !terms_accepted) {
            throw { status: 400, message: "Email, password and terms required" };
        }

        if (!personal_id || !address_card_number) {
            throw { status: 400, message: "Personal ID and address card required" };
        }

        if (!ENCRYPTION_KEY) {
            throw { status: 500, message: "Server config error" };
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Call database RPC
        const { error } = await supabase.rpc('register_user_v1', {
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
            throw { status: 400, message: "Registration failed" };
        }

        return { success: true, message: "Registration successful" };
    },

    async loginCompany(email: string, password: string, rememberMe: boolean) {
        // Validate input
        if (!email || !password) {
            throw { status: 400, message: "Missing required fields" };
        }

        interface data {
            id: number;
            company_credentials: {
                password_hash: string;
            };
        }

        // Fetch company data
        const { data: companyData, error: fetchError } = await supabase
            .from("companies")
            .select("id, company_credentials(password_hash)")
            .eq("email", email)
            .maybeSingle<data>();

        if (fetchError) throw fetchError;

        // Check credentials
        if (!companyData || !companyData.company_credentials || companyData.company_credentials.password_hash.length === 0){
            throw { status: 401, message: "Invalid credentials" };
        }

        const passwordHash = companyData.company_credentials.password_hash
        
        // Verify password
        const match = await bcrypt.compare(password, passwordHash);

        if (!match) {
            throw { status: 401, message: "Invalid credentials" };
        }

        // Check server config
        if (!JWT_SECRET) {
            console.error("Critical error: JWT secret not configured.");
            throw { status: 500, message: "Internal server configuration error" };
        }

        // Generate JWT token
        const expiresIn = rememberMe ? "7d" : "15m";
        const token = jwt.sign({ companyId: companyData.id, userType: 'company' }, JWT_SECRET, { expiresIn });

        // Set cookie options
        const cookieOptions: CookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "strict" as const
        };

        if (rememberMe) {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000;
        }

        return { token, cookieOptions };
    },

    async registerCompany(data: CompanyRegistrationData) {
        const { email, password,  name, address, tax_number, contact_person_name, activity_scope, website, short_description, phone_number, terms_accepted } = data;

        // Validate input
        if (!email || !terms_accepted || !password) {
            throw { status: 400, message: "Email, password and terms required" };
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Call database RPC
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
            throw { status: 400, message: "Registration failed" };
        }

        return { success: true, message: "Registration successful" };
    },

    verifyToken(token: string | undefined) {
        if (!token) return { loggedIn: false };

        try {
            // Verify JWT
            const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
            return {
                loggedIn: true,
                user: decoded,
                userType: decoded.userType
            };
        } catch {
            return { loggedIn: false };
        }
    }
};