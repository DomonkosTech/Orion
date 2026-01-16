import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CompanyHomePage.module.css";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

// API
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../api/advertisementApi";
import { getCompanystat, type DashboardStats, type LastApplication } from "../../../api/companyApi";



const CompanyHomePage: React.FC = () => {
    const navigate = useNavigate();
    const [ads, setAds] = useState<CompanyAdvertisement[]>([]);
    const [stats, setStats] = useState<DashboardStats>({});
    const [lastActivities, setLastActivities] = useState<LastApplication[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [adsData, statsData] = await Promise.all([
                    getCompanyAdvertisements(),
                    getCompanystat()
                ]);

                if (adsData.success) {
                    setAds(adsData.advertisements);
                }
                
                // A backend válasz struktúrája: { success: true, data: { stats: {...}, lastApplications: [...] } }
                if (statsData.success && statsData.data) {
                    setStats(statsData.data.stats || {});
                    setLastActivities(statsData.data.lastApplications || []);
                } else if (statsData.success && !statsData.data) {
                    // Fallback, ha esetleg a régi struktúra jönne vissza (közvetlenül a root-ban)
                    setStats(statsData.stats || {});
                    setLastActivities(statsData.lastApplications || []);
                }
            } catch (err) {
                console.error("Hiba az adatok lekérésekor:", err);
            }
        };
        fetchData();
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
                        <div className={styles.statValue}>{stats.views || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Aktív jelentkezők</div>
                        <div className={styles.statValue}>{stats.applicants || 0}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Alkalmazottak</div>
                        <div className={styles.statValue}>{stats.employees || "-"}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Konverzió</div>
                        <div className={styles.statValue}>{stats.conversion ? stats.conversion + "%" : "-"}</div>
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
                                    <div className={styles.badge}>Megtekintés</div>
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
                            {lastActivities.length > 0 ? (
                                lastActivities.map((activity, index) => (
                                    <div key={index} className={styles.jobItem}>
                                        <div className={styles.jobMeta}>
                                            <strong>{activity.users?.fname} {activity.users?.lname}</strong> jelentkezett: <i>{activity.advertisement?.title}</i>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.jobItem}>
                                    <div className={styles.jobMeta}>Nincs legutóbbi aktivitás.</div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyHomePage;
