import {Link, useNavigate} from "react-router-dom"; // 1. Import useNavigate
import styles from "./UserHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

function UserHomePage() {
    const navigate = useNavigate(); // 2. Initialize navigate

    return (
        <div className={styles.page}>
            <Header
                navItems={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Projects", href: "/projects" },
                    { label: "Team", href: "/team" },
                ]}
                actions={<Button>Settings</Button>}
            />

            <main>
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <BannerKicker>Gyors • Letisztult • Magyar piac</BannerKicker>

                        <h1 className={styles.heroTitle}>
                            Professzionális <span className={styles.accent}>karrierélmény</span>, egy helyen.
                        </h1>

                        <h1>SZAR MINDEN MAJD VALAKI EGYSZER MEGOLDJA NEKEM NINCS KEDVEM</h1>
                        <h2>ezért nem szabad felelőtlenül generáltatni kódot mert utána szopsz mint ha muszály lenne</h2>

                        <p className={styles.heroSubtitle}>
                            Fedezzen fel friss állásokat, finomhangolja a szűrőket, és jelentkezzen pár kattintással.
                        </p>

                        <div className={styles.heroActions}>
                            {/* 3. Replace Link with Button and pass existing styles */}
                            <Button
                                onClick={() => navigate("/listjobs")}
                                className={styles.primaryBtn}
                            >
                                Állások böngészése
                            </Button>

                            <Button
                                onClick={() => navigate("/cv")}
                                className={styles.secondaryBtn}
                                variant="secondary"
                            >
                                Önéletrajz feltöltése
                            </Button>
                        </div>
                    </div>
                </section>
                {/* Quick actions strip */}
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

                            <Link to="/jobapplication" className={styles.quickCard}>
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

                {/* Features */}
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
                                    Helyszín, pozíció és minimálbér alapján azonnali szűrés.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🛡️</div>
                                    <div className={styles.featureBadge}>Biztonság</div>
                                </div>
                                <h3 className={styles.featureTitle}>Adatvédelem</h3>
                                <p className={styles.featureText}>
                                    Tiszta folyamatok, átlátható működés, biztonságos alapok.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Categories */}
                <section className={styles.sectionAlt}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Népszerű kategóriák</h2>
                            <p className={styles.sectionSubtitle}>Induljon egy kategóriával, aztán finomítson szűrőkkel.</p>
                        </div>

                        <div className={styles.pills}>
                            <span className={styles.pill}>IT & Fejlesztés</span>
                            <span className={styles.pill}>Pénzügy & Számvitel</span>
                            <span className={styles.pill}>Értékesítés & Marketing</span>
                            <span className={styles.pill}>Egészségügy</span>
                            <span className={styles.pill}>Oktatás</span>
                            <span className={styles.pill}>Ügyfélszolgálat</span>
                        </div>

                        <div className={styles.callout}>
                            <div className={styles.calloutLeft}>
                                <div className={styles.calloutTitle}>Készen áll?</div>
                                <div className={styles.calloutText}>
                                    Nézze meg az állásokat, és mentse el a kedvenceket későbbre.
                                </div>
                            </div>
                            <Link to="/listjobs" className={styles.calloutBtn}>
                                Irány az állások
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}

            <Footer></Footer>

        </div>
    );
}

export default UserHomePage;