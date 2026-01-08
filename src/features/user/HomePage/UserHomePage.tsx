import { Link, useNavigate } from "react-router-dom";
import styles from "./UserHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import { useAuth } from "../../../hooks/useAuth";

function UserHomePage() {
    const navigate = useNavigate();
    const {name} = useAuth();



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
            <Header />

            <main>
                {/* Hero Section - Personalized Welcome */}
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <BannerKicker>Személyes Vezérlőpult</BannerKicker>

                        <h1 className={styles.heroTitle}>
                            Szia, <span className={styles.accent}>{name}</span>! 👋
                        </h1>

                        <p className={styles.heroSubtitle}>
                            Örülünk, hogy újra itt vagy. Nézzük, hol tartasz ma a karrierutadon,
                            és találjuk meg a következő nagy lehetőségedet!
                        </p>

                        <div className={styles.heroActions}>
                            <Button
                                onClick={() => navigate("/listjobs")}
                                color="orion-blue"
                                variant="primary"
                            >
                                Böngészés folytatása
                            </Button>

                            <Button
                                onClick={() => navigate("/EditUserProfile")}
                                variant="secondary"
                                color="orion-blue"
                            >
                                Profil szerkesztése
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Quick Actions Grid - Action Oriented */}
                <section className={styles.quick}>
                    <div className={styles.container}>
                        <div className={styles.quickGrid}>
                            <Link to="/listjobs" className={styles.quickCard}>
                                <div className={styles.quickIcon}>🔍</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Új állások keresése</div>
                                    <div className={styles.quickSub}>Találja meg az ideális pozíciót</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>

                            <Link to="/jobapplications" className={styles.quickCard}>
                                <div className={styles.quickIcon}>📈</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Aktív jelentkezések</div>
                                    <div className={styles.quickSub}>Kövesse nyomon a folyamatait</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>

                            <Link to="/cv" className={styles.quickCard}>
                                <div className={styles.quickIcon}>📄</div>
                                <div className={styles.quickText}>
                                    <div className={styles.quickTitle}>Dokumentumaim</div>
                                    <div className={styles.quickSub}>Önéletrajzok és motivációs levelek</div>
                                </div>
                                <div className={styles.quickArrow}>→</div>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Redesigned "Why Us" -> "Personalized Support" Section */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Miben segíthetünk ma?</h2>
                            <p className={styles.sectionSubtitle}>
                                Használja eszközeinket a hatékonyabb munkakereséshez és a szakmai fejlődéshez.
                            </p>
                        </div>

                        <div className={styles.featuresGrid}>
                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🎯</div>
                                    <div className={styles.featureBadge}>Tipp</div>
                                </div>
                                <h3 className={styles.featureTitle}>Személyre szabott találatok</h3>
                                <p className={styles.featureText}>
                                    Frissítse szakmai készségeit, hogy algoritmusunk pontosabb ajánlatokat mutasson.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>💌</div>
                                    <div className={styles.featureBadge}>Értesítő</div>
                                </div>
                                <h3 className={styles.featureTitle}>Legyen az első</h3>
                                <p className={styles.featureText}>
                                    Mentse el kereséseit, és küldünk egy üzenetet, amint releváns állást találunk.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>💡</div>
                                    <div className={styles.featureBadge}>Útmutató</div>
                                </div>
                                <h3 className={styles.featureTitle}>Interjú felkészülés</h3>
                                <p className={styles.featureText}>
                                    Olvassa el szakmai tanácsainkat, hogy magabiztosan álljon a munkáltatók elé.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Categories & Final Callout */}
                <section className={styles.sectionAlt}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Kiemelt szektorok</h2>
                            <p className={styles.sectionSubtitle}>Válasszon egy kategóriát, és fedezze fel a legfrissebb lehetőségeket.</p>
                        </div>

                        <div className={styles.pills}>
                            {categories.map((cat) => (
                                <span key={cat} className={styles.pill}>{cat}</span>
                            ))}
                        </div>

                        <div className={styles.callout}>
                            <div className={styles.calloutLeft}>
                                <div className={styles.calloutTitle}>Készen áll a következő fejezetre?</div>
                                <div className={styles.calloutText}>
                                    Nézze meg a legújabb 24 órában feladott hirdetéseket!
                                </div>
                            </div>
                            <Button
                                color="orion-blue"
                                onClick={() => navigate("/listjobs")}
                            >
                                Mai ajánlatok megtekintése
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