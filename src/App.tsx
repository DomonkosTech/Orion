import { useState } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import './App.css';

function App() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const particlesInit = async (engine: any) => {
        await loadFull(engine); // runtime works, no TS errors
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`Logging in with:\nEmail: ${email}\nPassword: ${password}`);
    };

    return (
        <div className="app-container">
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: { color: { value: "#242424" } },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onHover: { enable: true, mode: "grab" }, // particles follow the mouse
                            onClick: { enable: true, mode: "push" }, // add new particles on click
                        },
                        modes: {
                            grab: { distance: 150, links: { opacity: 0.5 } },
                            push: { quantity: 4 },
                        },
                    },
                    particles: {
                        color: { value: ["#646cff", "#ff64d2", "#64ffea"] },
                        links: { enable: true, color: "#646cff", distance: 150, opacity: 0.4, width: 1 },
                        collisions: { enable: true },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: { default: "bounce" },
                            random: true,
                            speed: { min: 1, max: 3 },
                        },
                        number: { density: { enable: true, area: 800 }, value: 60 },
                        opacity: { value: { min: 0.3, max: 0.8 }, animation: { enable: true, speed: 1, minimumValue: 0.3 } },
                        size: { value: { min: 2, max: 6 }, animation: { enable: true, speed: 3, minimumValue: 2 } },
                        shape: { type: ["circle", "triangle", "polygon"] },
                        trail: { enable: true, length: 5, fillColor: "#242424" },
                    },
                    detectRetina: true,
                }}
            />


            <form className="login-form" onSubmit={handleLogin}>
                <h1>Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}

export default App;
