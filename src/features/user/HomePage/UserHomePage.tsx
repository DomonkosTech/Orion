import { Link } from "react-router-dom";
import styles from "./UserHomePage.module.css";

//components

import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Buttons/Button.tsx";


function UserHomePage() {
    return (
        <div className={styles.page}>
            {/* Top bar */}
            <Header
                navItems={[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Projects", href: "/projects" },
                    { label: "Team", href: "/team" },
                ]}
                actions={
                    <Button>Settings</Button>
                }
            />
            {/* Hero */}
            <main>
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <div className={styles.heroKicker}>Gyors • Letisztult • Magyar piac</div>

                        <h1 className={styles.heroTitle}>
                            Professzionális <span className={styles.accent}>karrierélmény</span>, egy helyen.
                        </h1>

                        <p className={styles.heroSubtitle}>
                            Fedezzen fel friss állásokat, finomhangolja a szűrőket, és jelentkezzen pár kattintással.
                            A felület a fókuszról szól: a lényeg gyorsan megvan.
                        </p>

                        <div className={styles.heroActions}>
                            <Link to="/listjobs" className={styles.primaryBtn}>
                                Állások böngészése
                            </Link>
                            <Link to="/cv" className={styles.secondaryBtn}>
                                Önéletrajz feltöltése
                            </Link>
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
            <footer className={styles.footer}>
                <div className={styles.footerInner}>
                    <div className={styles.footerCol}>
                        <div className={styles.footerBrand}>Orion</div>
                        <div className={styles.footerMuted}>Letisztult karrierportál élmény.</div>
                    </div>

                    <div className={styles.footerCol}>
                        <div className={styles.footerTitle}>Gyors linkek</div>
                        <Link to="/listjobs" className={styles.footerLink}>Állások</Link>
                        <Link to="/jobapplication" className={styles.footerLink}>Jelentkezések</Link>
                        <Link to="/EditUserProfile" className={styles.footerLink}>Profil</Link>
                    </div>

                    <div className={styles.footerCol}>
                        <div className={styles.footerTitle}>Kapcsolat</div>
                        <a className={styles.footerLink} href="mailto:info@orion.hu">info@orion.hu</a>
                        <div className={styles.footerMuted}>+36 1 234 5678</div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    © {new Date().getFullYear()} Orion. Minden jog fenntartva.
                </div>
            </footer>
        </div>
    );
}

export default UserHomePage;