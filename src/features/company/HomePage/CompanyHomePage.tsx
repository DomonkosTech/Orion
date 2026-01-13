import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CompanyHomePage.module.css";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

// API
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi";

const CompanyHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [ads, setAds] = useState<CompanyAdvertisement[]>([]);

    // Mock adatok az extra "adatéhség" kielégítésére
    const stats = {
        totalViews: "12,402",
        activeApplicants: "148",
        avgTimeToFill: "18 nap",
        conversionRate: "4.2%"
    };

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const data = await getCompanyAdvertisements();
                if (data.success) {
                    setAds(data.advertisements);
                }
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            }
        };
        fetchAds();
    }, []);

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.container}>
                <header className={styles.dashboardHeader}>
                    <div>
                        <BannerKicker>Vállalati Vezérlőpult</BannerKicker>
                        <h1 className={styles.title}>Üdvözöljük újra!</h1>
                        <p className={styles.subtitle}>Kezelje toborzási folyamatait és elemezze a teljesítményt.</p>
                    </div>
                    <Button onClick={() => navigate("/AddJob")} color="orion-blue">
                        + Új hirdetés feladása
                    </Button>
                </header>

                {/* Statisztikai Sáv */}
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Összes megtekintés</div>
                        <div className={styles.statValue}>{stats.totalViews}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Aktív jelentkezők</div>
                        <div className={styles.statValue}>{stats.activeApplicants}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Betöltési idő</div>
                        <div className={styles.statValue}>{stats.avgTimeToFill}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Konverzió</div>
                        <div className={styles.statValue}>{stats.conversionRate}</div>
                    </div>
                </section>

                <div className={styles.mainGrid}>
                    {/* Aktív hirdetések listája */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Aktuális hirdetések ({ads.length})</h2>
                            <Button variant="secondary" onClick={() => navigate("/ShowListedJobs")}>Összes megtekintése</Button>
                        </div>
                        <div className={styles.jobList}>
                            {ads.slice(0, 5).map(ad => (
                                <div key={ad.id} className={styles.jobItem} onClick={() => navigate(`/company/ATS/${ad.id}`)}>
                                    <div className={styles.jobInfo}>
                                        <h4>{ad.title}</h4>
                                        <div className={styles.jobMeta}>{ad.position} • Aktív</div>
                                    </div>
                                    <div className={styles.badge}>12 új jelentkező</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Értesítések / Legutóbbi tevékenység */}
                    <aside className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Legutóbbi aktivitás</h2>
                        </div>
                        <div className={styles.jobList}>
                            <div className={styles.jobItem}>
                                <div className={styles.jobMeta}><strong>Kovács János</strong> jelentkezett: <i>Senior React Dev</i></div>
                            </div>
                            <div className={styles.jobItem}>
                                <div className={styles.jobMeta}>Hirdetés lejár: <i>Marketing Manager</i> (2 nap múlva)</div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyHomePage;