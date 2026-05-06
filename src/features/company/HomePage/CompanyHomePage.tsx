import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MessageSquare, Users, PlusCircle, Eye, UserCheck, TrendingUp } from "lucide-react";
import styles from "./CompanyHomePage.module.css";

// Components
import Button from "../../../components/ui/Button/Button.tsx";
import BannerKicker from "../../../components/layout/BannerKicker/BannerKicker.tsx";

// API
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi";
import { getCompanystat, type DashboardStats, type LastApplication } from "../../../Api/companyApi";

const CompanyHomePage: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('company');
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

                if (statsData.success && statsData.data) {
                    setStats(statsData.data.stats || {});
                    setLastActivities(statsData.data.lastApplications || []);
                } else if (statsData.success && !statsData.data) {
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
            <main className={styles.container}>
                <header className={styles.dashboardHeader}>
                    <div>
                        <BannerKicker>{t('home.banner')}</BannerKicker>
                        <h1 className={styles.title}>{t('home.title')}</h1>
                        <p className={styles.subtitle}>{t('home.subtitle')}</p>
                    </div>
                </header>

                {/* Statisztikai Sáv */}
                <section className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <Eye size={32} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>{t('home.stats.views')}</div>
                            <div className={styles.statValue}>{stats.views || 0}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <UserCheck size={32} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>{t('home.stats.applicants')}</div>
                            <div className={styles.statValue}>{stats.applicants || 0}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <Users size={32} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>{t('home.stats.employees')}</div>
                            <div className={styles.statValue}>{stats.employees || "-"}</div>
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statIconWrapper}>
                            <TrendingUp size={32} />
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>{t('home.stats.conversion')}</div>
                            <div className={styles.statValue}>{stats.conversion ? stats.conversion + "%" : "-"}</div>
                        </div>
                    </div>
                </section>

                {/* Gyorsműveletek Sáv */}
                <section className={styles.quickActions}>
                    <div className={styles.actionCard} onClick={() => navigate("/AddJob")}>
                        <div className={styles.actionIcon}>
                            <PlusCircle size={24} />
                        </div>
                        <div className={styles.actionContent}>
                            <h3>{t('home.quickActions.newJob.title')}</h3>
                            <p>{t('home.quickActions.newJob.description')}</p>
                        </div>
                    </div>
                    <div className={styles.actionCard} onClick={() => navigate("/messenger")}>
                        <div className={styles.actionIcon}>
                            <MessageSquare size={24} />
                        </div>
                        <div className={styles.actionContent}>
                            <h3>{t('home.quickActions.messenger.title')}</h3>
                            <p>{t('home.quickActions.messenger.description')}</p>
                        </div>
                    </div>
                    <div className={styles.actionCard} onClick={() => navigate("/employees")}>
                        <div className={styles.actionIcon}>
                            <Users size={24} />
                        </div>
                        <div className={styles.actionContent}>
                            <h3>{t('home.quickActions.employees.title')}</h3>
                            <p>{t('home.quickActions.employees.description')}</p>
                        </div>
                    </div>
                </section>

                <div className={styles.mainGrid}>
                    {/* Aktív hirdetések listája */}
                    <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{t('home.activeJobs.title')} ({ads.length})</h2>
                            <Button variant="secondary" color={"orion-blue"} onClick={() => navigate("/ShowListedJobs")}>{t('home.activeJobs.viewAll')}</Button>
                        </div>
                        <div className={styles.jobList}>
                            {[...ads].sort((a, b) => Number(b.is_active) - Number(a.is_active)).slice(0, 5).map(ad => (
                                <div key={ad.id} className={styles.jobItem} onClick={() => navigate(`/company/ATS/${ad.id}`)}>
                                    <div className={styles.jobInfo}>
                                        <h4>{ad.title}</h4>
                                        <div className={styles.jobMeta}>{ad.position} • <span className={ad.is_active ? styles.badge : styles.badgeInactive}>{ad.is_active ? t('home.activeJobs.statusActive') : t('home.activeJobs.statusInactive')}</span></div>
                                    </div>
                                    <span className={styles.viewLink}>{t('home.activeJobs.view')}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Értesítések / Legutóbbi tevékenység */}
                    <aside className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>{t('home.recentActivity.title')}</h2>
                        </div>
                        <div className={styles.activityList}>
                            {lastActivities.length > 0 ? (
                                lastActivities.map((activity, index) => (
                                    <div key={index} className={styles.activityItem}>
                                        <div className={styles.jobMeta}>
                                            <strong
                                                className={styles.activityName}
                                                onClick={() => {
                                                    const ad = ads.find(a => a.title === activity.advertisement?.title);
                                                    if (ad) {
                                                        navigate(`/company/ATS/${ad.id}?name=${encodeURIComponent(`${activity.users?.fname} ${activity.users?.lname}`)}`);
                                                    }
                                                }}
                                            >{activity.users?.fname} {activity.users?.lname}</strong> {t('home.recentActivity.applied')} <i>{activity.advertisement?.title}</i>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.activityItem}>
                                    <div className={styles.jobMeta}>Nincs legutóbbi aktivitás.</div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default CompanyHomePage;