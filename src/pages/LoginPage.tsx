import React, {useCallback, useState} from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";

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
        localStorage.clear();
        alert("Registration placeholder — not yet implemented.");
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const particlesInit = useCallback(async (engine: any) => {
        await loadFull(engine);
    }, []);


    return (
        <div className="homepage-container">
            {/* Background particles */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: { color: { value: "#000000" } },
                    fpsLimit: 60,
                    particles: {
                        number: { value: 0 },
                        shape: { type: "circle" },
                        size: {
                            value: 300,
                            animation: { enable: true, speed: 1, minimumValue: 450 },
                        },
                        opacity: {
                            value: 0.25,
                            animation: { enable: true, speed: 0.3, minimumValue: 0.1 },
                        },
                        move: {
                            enable: false,
                            speed: 0.1,
                            straight: false,
                            outModes: { default: "out" },
                        },
                        shadow: { enable: true, color: "#1e90ff", blur: 100 },
                    },
                    manualParticles: [
                        {
                            position: { x: 60, y: 0 },
                            options: { color: { value: "#0a58f7" }, size: { value: 550 } },
                        },
                        {
                            position: { x: 25, y: 86 },
                            options: { color: { value: "#1e90ff" }, size: { value: 500 } },
                        },
                    ],
                    detectRetina: true,
                }}
            />

            {/* Glass overlay */}
            <div className="glass-overlay"></div>

            {/* Page content */}
            <div className="homepage-content">
                <div className="lang-container">
                    <div className="language-options">
                        <p>válassz nyelvet</p>
                    </div>
                    <div className="flag-icon">
                        <span role="img" aria-label="Magyar zászló">🇭🇺</span>
                    </div>
                </div>

                <div className="glass-panel">
                    <h1>Belépés</h1>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "10px",
                            marginTop: "20px",
                        }}
                    >
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                padding: "10px",
                                borderRadius: "5px",
                                border: "none",
                                width: "250px",
                            }}
                        />

                        <input
                            type="password"
                            placeholder="Jelszó"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                padding: "10px",
                                borderRadius: "5px",
                                border: "none",
                                width: "250px",
                            }}
                        />
                        <br />

                        <button
                            onClick={handleLogin}
                            disabled={email.trim().length < 1 || password.trim().length < 1}
                            className="glass-button"
                        >
                            Belépés
                        </button>

                        <button onClick={handleRegister} className="glass-button">
                            Regisztráció
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
