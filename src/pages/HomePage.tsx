import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const particlesInit = async (engine: any) => {
        await loadFull(engine);
    };

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
                        color: { value: ["#0a58f7", "#1e90ff", "#00c3ff"] },
                        move: {
                            enable: true,
                            speed: 0.1,
                            random: false,
                            straight: false,
                            outModes: { default: "out" },
                        },
                        number: { value: 2 },
                        opacity: {
                            value: 0.25,
                            animation: { enable: true, speed: 0.3, minimumValue: 0.1, sync: false },
                        },
                        size: {
                            value: 600,
                            animation: { enable: true, speed: 1, minimumValue: 450, sync: false },
                        },
                        shape: { type: "circle" },
                        shadow: { enable: true, color: "#1e90ff", blur: 100 },
                    },
                    detectRetina: true,
                }}
            />

            {/* Glass overlay */}
            <div className="glass-overlay"></div>

            {/* Page content */}
            <div className="homepage-content">
                <h1>Welcome to the HomePage</h1>
                <div className="homepage-buttons">
                    <Link to="/domonkos">
                        <button>Go to Domonkos</button>
                    </Link>
                    <Link to="/peti">
                        <button>Go to Peti</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePage;
