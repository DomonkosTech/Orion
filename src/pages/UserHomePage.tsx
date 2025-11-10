import { Link } from "react-router-dom";
import "./HomePage.css";

function UserHomePage() {
    return (
        <div className="homepage-container">
            {/* Header */}
            <header className="header">
                <div className="logo">ProfiPortál</div>
                <nav className="navigation">
                    <Link to="/login" className="nav-btn">Bejelentkezés</Link>
                    <Link to="/register" className="nav-btn primary">Regisztráció</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Professzionális Karrier Portál</h1>
                    <p>Csatlakozz a legjobb magyar szakemberek közösségéhez. Találd meg álmaid állását, vagy fedezz fel tehetséges kollégákat.</p>
                    <div className="hero-buttons">
                        <Link to="/jobs" className="cta-btn primary">Állások Böngészése</Link>
                        <Link to="/cv" className="cta-btn secondary">Önéletrajz Feltöltése</Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2>Miért Válassz Minket?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">💼</div>
                        <h3>Minőségi Állások</h3>
                        <p>Csak hitelesített cégek és komoly munkaadók állásajánlatai.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Gyors Találat</h3>
                        <p>Okos szűrési lehetőségekkel gyorsan megtalálod ami neked való.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🛡️</div>
                        <h3>Adatvédelem</h3>
                        <p>Személyes adataid biztonságban, GDPR-kompatibilis megoldás.</p>
                    </div>
                </div>
            </section>

            {/* Job Categories */}
            <section className="categories-section">
                <h2>Népszerű Kategóriák</h2>
                <div className="categories-grid">
                    <div className="category-item">IT & Fejlesztés</div>
                    <div className="category-item">Pénzügy & Számvitel</div>
                    <div className="category-item">Értékesítés & Marketing</div>
                    <div className="category-item">Egészségügy</div>
                    <div className="category-item">Oktatás</div>
                    <div className="category-item">Ügyfélszolgálat</div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>ProfiPortál</h4>
                        <p>Magyarország vezető karrier portálja</p>
                    </div>
                    <div className="footer-section">
                        <h4>Kapcsolat</h4>
                        <p>info@profiportal.hu</p>
                        <p>+36 1 234 5678</p>
                    </div>
                    <div className="footer-section">
                        <h4>Információ</h4>
                        <a href="#">Adatvédelmi nyilatkozat</a>
                        <a href="#">Általános Szerződési Feltételek</a>
                        <a href="#">Gyakran Ismételt Kérdések</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 ProfiPortál. Minden jog fenntartva.</p>
                </div>
            </footer>
        </div>
    );
}

export default UserHomePage;