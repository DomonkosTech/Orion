import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styles from "../ListAllJobs/ListJobs.module.css";

// Components
import { Header } from "../../../../components/Header/Header.tsx";
import JobCard from "../ListAllJobs/components/JobCard.tsx";
import SkeletonCard from "../ListAllJobs/components/SkeletonCard.tsx";
import EmptyState from "../ListAllJobs/components/EmptyState.tsx";
import { getFavorites, type Job } from "../../../../Api/advertisementApi.ts";
import Footer from "../../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../../components/BannerKicker/BannerKicker.tsx";

// Helper for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: "HUF",
        maximumFractionDigits: 0,
    }).format(amount);
};

const ShowFavoritesJobs: React.FC = () => {
    const { t } = useTranslation('user');
    const [jobs, setJobs] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const fetchFavoriteJobs = async () => {
        setLoading(true);
        setError(null);
        try {
            const favoriteJobsData = await getFavorites(true);
            if (Array.isArray(favoriteJobsData)) {
                // Assuming the structure is [{ id, user_id, advertisement_id, advertisement: Job }, ...]
                const extractedJobs = favoriteJobsData.map(fav => fav.advertisement).filter(Boolean);
                setJobs(extractedJobs);
            } else {
                setJobs([]);
                console.warn("Expected an array of favorite jobs, but received:", favoriteJobsData);
            }
        } catch (err) {
            console.error(err);
            setError(t('jobs.favorites.error', 'Hiba történt a kedvencek betöltése közben.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavoriteJobs();
    }, [t]);

    const handleshowClick = (adId: number) => {
        navigate(`/job/show/${adId}`);
    };

    const handleFavoriteRemoved = (jobId: number) => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.dashboardHeader}>
                        <div className={styles.welcomeSection}>
                            <div className={styles.kickerWrapper}>
                                <BannerKicker>{t('jobs.favorites.kicker', 'Kedvencek')}</BannerKicker>
                            </div>
                            <h1 className={styles.heroTitle}>
                                <Trans t={t} i18nKey="jobs.favorites.title">
                                    Kedvenc <span className={styles.accent}>állásajánlataid</span>
                                </Trans>
                            </h1>
                             <p className={styles.heroSubtitle}>
                                {jobs.length > 0 && !loading ? (
                                    <Trans t={t} i18nKey="jobs.favorites.subtitle" values={{ count: jobs.length }}>
                                        Jelenleg <strong>{{count: jobs.length}}</strong> kedvenc ajánlatod van.
                                    </Trans>
                                ) : (
                                     !loading && (
                                    <Trans t={t} i18nKey="jobs.favorites.subtitleEmpty">
                                        Nincsenek még kedvenc ajánlataid.
                                    </Trans>
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('jobs.list.errorTitle', 'Hoppá!')}</h3>
                            <p style={{ color: 'var(--muted)' }}>{error}</p>
                        </div>
                    )}

                    {!loading && !error && jobs.length === 0 && (
                        <EmptyState onClear={() => navigate('/jobs')} />
                    )}

                    {!error && (
                        <>
                            {jobs.length > 0 && (
                                <div className={styles.grid}>
                                    {jobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onOpen={() => handleshowClick(job.id)}
                                            formatCurrency={formatCurrency}
                                            isAI={false}
                                            isFavorite={true}
                                            onFavoriteAdded={() => {}}
                                            onFavoriteRemoved={() => handleFavoriteRemoved(job.id)}
                                        />
                                    ))}
                                </div>
                            )}
                            {loading && (
                                <div className={styles.grid}>
                                    {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ShowFavoritesJobs;
