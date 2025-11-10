import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const CompanyLoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();




    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            alert("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("http://localhost:4000/api/company/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Ez fontos a cookie-hoz!
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await res.json();


            if (data.success)
            {
                alert("Sikeres bejelentkezés!");
                navigate("/company");
                window.location.reload();

            }
            else{
                alert(data.error || "Hiba történt")
            }




        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/CompanyRegisterPage");
    };

    const handleswitch = () => {
        navigate("/UserLoginPage");
    };

    const handleForgotPassword = () => {
        // Implement forgot password functionality
        alert("Elfelejtett jelszó funkció hamarosan elérhető!");
    };

    return (

        <form onSubmit={handleLogin}>
            <h1>cég bejelentkezés</h1>

            <div>

                <label htmlFor="email">Email cím</label>
                <input
                    id="email"
                    type="email"
                    placeholder="email@pelda.hu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="password">Jelszó</label>
                <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Emlékezz rám
                </label>
                <a href="#" onClick={handleForgotPassword}>
                    Elfelejtette jelszavát?
                </a>
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
            </button>

            <button type="button" onClick={handleRegister}>
                Regisztráció
            </button>

            <p>
                Nincs még fiókja?{" "}
                <a href="#" onClick={handleRegister}>
                    Regisztráljon itt
                </a>
            </p>
            <button type="button" onClick={handleswitch}>
                felhasználó nézet
            </button>
        </form>

    );
};


export default CompanyLoginPage;
