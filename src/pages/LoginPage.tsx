import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const LoginPage: React.FC = () => {
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    const handleForgotPassword = () => {
        // Implement forgot password functionality
        alert("Elfelejtett jelszó funkció hamarosan elérhető!");
    };

    return (
        <div className="login-container">
            {/* Header */}
            <header className="login-header">
                <div className="logo">YourLogo</div>
                <nav className="navigation">
                    <button className="nav-btn" onClick={() => navigate("/")}>
                        Főoldal
                    </button>
                    <button className="nav-btn" onClick={handleRegister}>
                        Regisztráció
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="login-content">
                <div className="login-card">
                    <h1>Bejelentkezés</h1>
                    <p className="login-subtitle">
                        Üdvözöljük újra! Kérjük, jelentkezzen be fiókjába
                    </p>

                    <form className="login-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label htmlFor="email">Email cím</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="email@pelda.hu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Jelszó</label>
                            <input
                                id="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="login-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                Emlékezz rám
                            </label>
                            <a
                                href="#"
                                className="forgot-password"
                                onClick={handleForgotPassword}
                            >
                                Elfelejtette jelszavát?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="login-btn primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Bejelentkezés..." : "Bejelentkezés"}
                        </button>

                        <div className="divider">
                            <span>vagy</span>
                        </div>

                        <button
                            type="button"
                            className="login-btn secondary"
                            onClick={handleRegister}
                        >
                            Regisztráció
                        </button>
                    </form>

                    <footer className="login-footer">
                        <p>
                            Nincs még fiókja?{" "}
                            <a href="#" onClick={handleRegister}>
                                Regisztráljon itt
                            </a>
                        </p>
                    </footer>
                </div>
            </main>

            {/* Footer */}
            <footer className="login-footer-bottom">
                <p>&copy; 2024 Your Company. Minden jog fenntartva.</p>
            </footer>
        </div>
    );
};

export default LoginPage;