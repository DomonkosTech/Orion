import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            alert("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        try {
            const res = await fetch("http://localhost:4000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Hiba a bejelentkezés során");
                return;
            }

            alert("Sikeres bejelentkezés!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        }
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
