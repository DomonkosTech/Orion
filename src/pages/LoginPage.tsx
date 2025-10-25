import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import bcrypt from "bcryptjs";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        // 1️⃣ Felhasználó lekérése email alapján
        const { data: user, error: userError } = await supabase
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (userError) {
            console.error("Supabase hiba:", userError);
        }

        if (!user) {
            alert("Nincs ilyen email a rendszerben!");
            return;
        }

        // 2️⃣ Jelszó-hash lekérése
        const { data: credentials, error: credError } = await supabase
            .from("user_credentials")
            .select("password_hash")
            .eq("user_id", user.id)
            .maybeSingle();

        if (credError) {
            console.error("Supabase hiba:", credError);
        }

        if (!credentials) {
            alert("Ehhez a felhasználóhoz nincs jelszó beállítva!");
            return;
        }

        // 3️⃣ Jelszó ellenőrzése
        const match = await bcrypt.compare(password, credentials.password_hash);

        if (!match) {
            alert("Hibás jelszó!");
            return;
        }

        alert("Sikeres bejelentkezés!");
        navigate("/");
    };


    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div>
            <h1>Bejelentkezés</h1>

            <div>
                <label>Email:</label>
                <input
                    type="email"
                    placeholder="email@pelda.hu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div>
                <label>Jelszó:</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <div>
                <button onClick={handleLogin}>Bejelentkezés</button>
                <button onClick={handleRegister}>Regisztráció</button>
            </div>
        </div>
    );
};

export default LoginPage;
