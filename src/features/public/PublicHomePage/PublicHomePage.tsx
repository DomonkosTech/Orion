import { useNavigate } from "react-router-dom";
import styles from "./PublicHomePage.module.css";

// components
import { Header } from "../../../components/Header/Header.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

function PublicHomePage() {
    const navigate = useNavigate();


    const featuredJobs = [
        { title: "Senior Frontend Developer", category: "IT", location: "Budapest / Remote" },
        { title: "Marketing Manager", category: "Marketing", location: "Budapest" },
        { title: "Ügyfélszolgálati Csoportvezető", category: "Support", location: "Debrecen" },
    ];

    return (
        <div className={styles.page}>
            <Header
                navItems={[
                    { label: "Nyitott pozíciók", href: "/listjobs" },
                    { label: "Rólunk", href: "#about" },
                    { label: "Kultúra", href: "#culture" },
                    { label: "Segítség", href: "#faq" },
                ]}
                actions={
                    <Button variant="link" onClick={() => navigate("/login")} underline>
                        Bejelentkezés
                    </Button>
                }
            />

            <main>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroInner}>
                        <BannerKicker>Karrier • Fejlődés • Stabilitás</BannerKicker>

                        <h1 className={styles.heroTitle}>
                            Építse a jövőjét <span className={styles.accent}>szakértő</span> csapatunkban.
                        </h1>

                        <p className={styles.heroSubtitle}>
                            Csatlakozzon Magyarország egyik legdinamikusabban fejlődő közösségéhez.
                            Értékteremtő munka, modern eszközök és valódi szakmai támogatás várja.
                        </p>

                        <div className={styles.heroActions}>
                            <Button
                                onClick={() => navigate("/listjobs")}
                                color="orion-blue"
                                variant="primary"
                            >
                                Nyitott pozíciók megtekintése
                            </Button>

                            <Button
                                onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                                variant="secondary"
                                color="orion-blue"
                            >
                                Miért válasszon minket?
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Value Propositions */}
                <section className={styles.section} id="about">
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Munkavállalói élmény nálunk</h2>
                            <p className={styles.sectionSubtitle}>
                                Nem csak állást, hanem karrierutat kínálunk. Hiszünk a folyamatos tanulásban és a munka-magánélet egyensúlyában.
                            </p>
                        </div>

                        <div className={styles.featuresGrid}>
                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🚀</div>
                                    <div className={styles.featureBadge}>Fejlődés</div>
                                </div>
                                <h3 className={styles.featureTitle}>Szakmai tréningek</h3>
                                <p className={styles.featureText}>
                                    Éves képzési keret és belső mentorprogram segíti a folyamatos előrelépést.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>🏠</div>
                                    <div className={styles.featureBadge}>Rugalmasság</div>
                                </div>
                                <h3 className={styles.featureTitle}>Hibrid munkavégzés</h3>
                                <p className={styles.featureText}>
                                    Modern irodai környezet és otthoni munkavégzés ideális kombinációja.
                                </p>
                            </article>

                            <article className={styles.feature}>
                                <div className={styles.featureTop}>
                                    <div className={styles.featureIcon}>💎</div>
                                    <div className={styles.featureBadge}>Érték</div>
                                </div>
                                <h3 className={styles.featureTitle}>Prémium juttatások</h3>
                                <p className={styles.featureText}>
                                    Versenyképes bérsávok, cafeteria és egészségbiztosítás minden kollégánknak.
                                </p>
                            </article>
                        </div>
                    </div>
                </section>

                {/* Featured Jobs Preview */}
                <section className={styles.sectionAlt}>
                    <div className={styles.container}>
                        <div className={styles.sectionHead}>
                            <h2 className={styles.sectionTitle}>Kiemelt lehetőségeink</h2>
                            <p className={styles.sectionSubtitle}>Tekintse meg legfrissebb állásajánlatainkat és találja meg az Önnek megfelelőt.</p>
                        </div>

                        <div className={styles.jobList}>
                            {featuredJobs.map((job, index) => (
                                <div key={index} className={styles.jobCard}>
                                    <div className={styles.jobInfo}>
                                        <span className={styles.jobCategory}>{job.category}</span>
                                        <h4 className={styles.jobCardTitle}>{job.title}</h4>
                                        <p className={styles.jobLocation}>{job.location}</p>
                                    </div>
                                    <Button
                                        variant="secondary"
                                        color="orion-blue"
                                        onClick={() => navigate("/listjobs")}
                                    >
                                        Részletek
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className={styles.callout}>
                            <div className={styles.calloutLeft}>
                                <div className={styles.calloutTitle}>Nem találta meg amit keresett?</div>
                                <div className={styles.calloutText}>
                                    Regisztráljon adatbázisunkba, és értesítjük, ha érkezik Önhöz illő lehetőség.
                                </div>
                            </div>
                            <Button
                                color="orion-blue"
                                onClick={() => navigate("/register")}
                            >
                                Regisztráció
                            </Button>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default PublicHomePage;