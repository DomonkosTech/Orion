import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { supabase } from "./supabaseClient";

const app = express();
app.use(cors());
app.use(express.json());

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

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
