import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = () => {
        // simple mock login (you can replace this with backend validation later)
        if (email.trim() && password.trim()) {
            localStorage.setItem("loggedIn", "true");
            localStorage.setItem("email", email);
            navigate("/"); // redirect to HomePage.tsx
        }
    };

    const handleRegister = () => {
        navigate("/register");
    };

    return (
        <div className="login-container">
            {/* Header */}
            <header className="login-header">
                <div className="logo">ProfiPortál</div>
                <nav className="navigation">
                    <button onClick={() => navigate("/")} className="nav-btn">Főoldal</button>
                </nav>
            </header>

            {/* Main Content */}
            <div className="login-content">
                <div className="login-card">
                    <h1>Bejelentkezés</h1>
                    <p className="login-subtitle">Üdvözöljük újra a ProfiPortál-on</p>

                    <div className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email cím</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="email@pelda.hu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Jelszó</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input"
                            />
                        </div>

                        <div className="login-options">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Emlékezz rám
                            </label>
                            <a href="#" className="forgot-password">Elfelejtett jelszó?</a>
                        </div>

                        <button
                            onClick={handleLogin}
                            disabled={email.trim().length < 1 || password.trim().length < 1}
                            className="login-btn primary"
                        >
                            Bejelentkezés
                        </button>

                        <div className="divider">
                            <span>vagy</span>
                        </div>

                        <button onClick={handleRegister} className="login-btn secondary">
                            Új fiók létrehozása
                        </button>
                    </div>

                    <div className="login-footer">
                        <p>Problémád van a bejelentkezéssel? <a href="#">Segítségkérés</a></p>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="login-footer-bottom">
                <p>© 2025 ProfiPortál. Minden jog fenntartva.</p>
            </footer>
        </div>
    );
};

export default LoginPage;