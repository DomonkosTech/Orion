import { Link, useNavigate } from "react-router-dom";
import styles from "./UserHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

function UserHomePage() {
    const navigate = useNavigate();

    const categories = [
        "IT & Fejlesztés",
        "Pénzügy & Számvitel",
        "Értékesítés & Marketing",
        "Egészségügy",
        "Oktatás",
        "Ügyfélszolgálat"
    ];

    return (
        <div className={styles.page}>
            <Header

            />

            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <BannerKicker>Gyors • Letisztult • Magyar piac</BannerKicker>

                        <h1 className={styles.heroTitle}>
                            Professzionális <span className={styles.accent}>karrierélmény</span>, egy helyen.
                        </h1>

                        <p className={styles.heroSubtitle}>
                            Fedezzen fel friss állásokat, finomhangolja a szűrőket, és jelentkezzen pár kattintással.
                            Az Ön karrierje a mi prioritásunk.
                        </p>

                        <div className={styles.heroActions}>
                            <Button
                                onClick={() => navigate("/listjobs")}
                                color="orion-blue"
                                variant="primary"
                            >
                                Állások böngészése
                            </Button>

                            <Button
                                onClick={() => navigate("/cv")}
                                variant="secondary"
                                color="orion-blue"
                            >
                                Önéletrajz feltöltése
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid */}
                <section className={styles.quick}>
                    <div className={styles.container}>
                        <div className={styles.quickGrid}>
                            <Link to="/listjobs" className={styles.quickCard}>
                                <div className={styles.quickIcon}>🔎</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Keresés indítása</div>
                                    <div className={styles.quickSub}>Pozíció, helyszín, bér</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>

                            <Link to="/jobapplications" className={styles.quickCard}>
                                <div className={styles.quickIcon}>📌</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Jelentkezéseim</div>
                                    <div className={styles.quickSub}>Státuszok áttekintése</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>

                            <Link to="/EditUserProfile" className={styles.quickCard}>
                                <div className={styles.quickIcon}>👤</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Profil frissítése</div>
                                    <div className={styles.quickSub}>Legyen naprakész</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Miért ezt a felületet?</h2>
                            <p className={styles.sectionSubtitle}>
                                Minimalista stílus, hatékony keresés, prémium érzet — felesleges zaj nélkül.
                            </p>
                        </div>

                        <div className={styles.featuresGrid}>
                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>💼</div>
                                    <div className={styles.featureBadge}>Minőség</div>
                                </div>
                                <h3 className={styles.featureTitle}>Minőségi állások</h3>
                                <p className={styles.featureText}>
                                    Fókusz a releváns hirdetéseken, könnyen áttekinthető kártyákkal.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>⚡</div>
                                    <div className={styles.featureBadge}>Gyorsaság</div>
                                </div>
                                <h3 className={styles.featureTitle}>Gyors találat</h3>
                                <p className={styles.featureText}>
                                    Helyszín, pozíció és bérsáv alapján azonnali, releváns szűrés.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🛡️</div>
                                    <div className={styles.featureBadge}>Biztonság</div>
                                </div>
                                <h3 className={styles.featureTitle}>Adatvédelem</h3>
                                <p className={styles.featureText}>
                                    Tiszta folyamatok, átlátható működés és biztonságos adatkezelés.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Categories & Callout Section */}
                <section className={styles.sectionAlt}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Népszerű kategóriák</h2>
                            <p className={styles.sectionSubtitle}>Induljon egy kategóriával, aztán finomítson szűrőkkel.</p>
                        </div>

                        <div className={styles.pills}>
                            {categories.map((cat) => (
                                <span key={cat} className={styles.pill}>{cat}</span>
                            ))}
                        </div>

                        <div className={styles.callout}>
                            <div className={styles.calloutLeft}>
                                <div className={styles.calloutTitle}>Készen áll a következő lépésre?</div>
                                <div className={styles.calloutText}>
                                    Nézze meg az állásokat, és mentse el a kedvenceket későbbre.
                                </div>
                            </div>
                            <Button
                                color="orion-blue"
                                onClick={() => navigate("/listjobs")}
                            >
                                Irány az állások
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default UserHomePage;