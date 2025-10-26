import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = "https://nlabffngmifszpwrqetx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sYWJmZm5nbWlmc3pwd3JxZXR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjA3MjMsImV4cCI6MjA3NTQzNjcyM30.IEH4RRFex_Apkay3DIxGoAHrQ9Dtsr46XMKo2zdzPzU";
export const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Login endpoint
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const { data: user } = await supabase.from("users").select("id").eq("email", email).maybeSingle();
    if (!user) return res.status(404).json({ error: "No user found" });

    const { data: credentials } = await supabase.from("user_credentials").select("password_hash").eq("user_id", user.id).maybeSingle();
    if (!credentials) return res.status(404).json({ error: "No password set" });

    const match = await bcrypt.compare(password, credentials.password_hash);
    if (!match) return res.status(401).json({ error: "Invalid password" });

    res.json({ success: true, userId: user.id });
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

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));