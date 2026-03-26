import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import styles from "./ShowFavoritesJobs.module.css";
import { Trash2, MapPin, Briefcase, Search, ArrowLeft } from "lucide-react";

// Components
import { Header } from "../../../../components/layout/Header/Header.tsx";
import { getFavorites, getAdvertisementById, type Job, removeFavorite } from "../../../../Api/advertisementApi.ts";
import Footer from "../../../../components/layout/Footer/Footer.tsx";
import Button from "../../../../components/ui/Button/Button.tsx";

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
                const extractedJobs = favoriteJobsData.map(fav => {
                    if (fav.advertisement) {
                        return { ...fav.advertisement };
                    }
                    return null;
                }).filter(Boolean) as Job[];

                // The /favorites endpoint doesn't include company data, so we fetch
                // each advertisement individually (same endpoint ShowJob uses) to get the company name.
                const enriched = await Promise.all(
                    extractedJobs.map(async (job) => {
                        try {
                            const detail = await getAdvertisementById(String(job.id));
                            if (detail.success && detail.advertisement?.company) {
                                return { ...job, company: detail.advertisement.company };
                            }
                        } catch {
                            // silently fall back to job without company
                        }
                        return job;
                    })
                );

                setJobs(enriched);
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

    const handleRemoveFavorite = async (e: React.MouseEvent, jobId: number) => {
        e.stopPropagation();
        try {
            const response = await removeFavorite(jobId);
            if (response.success) {
                setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
            }
        } catch (err) {
            console.error("Failed to remove favorite", err);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{t('jobs.favorites.title', 'Kedvenc állásajánlataid')}</h1>
                    <p className={styles.subtitle}>
                        {jobs.length > 0 && !loading ? (
                            <Trans t={t} i18nKey="jobs.favorites.subtitle" values={{ count: jobs.length }}>
                                Jelenleg <strong>{jobs.length}</strong> kedvenc ajánlatod van.
                            </Trans>
                        ) : (
                            !loading && (
                                <Trans t={t} i18nKey="jobs.favorites.subtitleEmpty">
                                    Nincsenek még kedvenc ajánlataid.
                                </Trans>
                            )
                        )}
                    </p>
                    <div className={styles.headerActions}>
                        <Button
                            onClick={() => navigate(-1)}
                            variant="secondary"
                            color="orion-blue"
                            className={styles.backButton}
                        >
                            <ArrowLeft size={18} />
                            {t('navigation.favorites.back')}
                        </Button>
                        <Button
                            onClick={() => navigate('/listjobs')}
                            variant="secondary"
                            color="orion-blue"
                            className={styles.searchButton}
                        >
                            <Search size={18} />
                            {t('jobs.favorites.searchMore', 'További állások keresése')}
                        </Button>
                    </div>
                </header>

                {error && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('jobs.list.errorTitle', 'Hoppá!')}</h3>
                        <p style={{ color: 'var(--muted)' }}>{error}</p>
                    </div>
                )}

                {!loading && !error && jobs.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3 className={styles.emptyTitle}>{t('jobs.favorites.noFavorites', 'Még nincsenek kedvenceid')}</h3>
                        <p>{t('jobs.favorites.emptyDesc', 'Böngéssz az állások között és mentsd el a neked tetszőket!')}</p>
                        <div className={styles.emptyAction}>
                            <Button onClick={() => navigate('/listjobs')} variant="primary">
                                {t('jobs.favorites.browse', 'Böngészés')}
                            </Button>
                        </div>
                    </div>
                )}

                {!error && (
                    <div className={styles.favoritesList}>
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className={styles.favoriteItem}
                                onClick={() => handleshowClick(job.id)}
                            >
                                <div className={styles.itemLogo}>
                                    {(job.company?.name || job.company_name || "J").charAt(0)}
                                </div>
                                <div className={styles.itemContent}>
                                    <h3 className={styles.itemTitle}>{job.title}</h3>
                                    <div className={styles.itemMeta}>
                                        <span><Briefcase size={16} /> {job.company?.name || job.company_name || "Orion Partner"}</span>
                                        <span><MapPin size={16} /> {job.location}</span>
                                    </div>
                                    <div className={styles.itemWage}>
                                        {formatCurrency(job.hourly_wage)}
                                    </div>
                                </div>
                                <div className={styles.itemActions}>
                                    <button
                                        className={styles.removeButton}
                                        onClick={(e) => handleRemoveFavorite(e, job.id)}
                                        title={t('jobs.favorites.remove', 'Eltávolítás')}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {loading && [1, 2, 3].map(n => (
                            <div key={n} className={styles.favoriteItem} style={{ opacity: 0.5 }}>
                                <div className={styles.itemLogo} style={{ background: '#eee' }} />
                                <div className={styles.itemContent}>
                                    <div style={{ height: '20px', width: '200px', background: '#eee', marginBottom: '8px' }} />
                                    <div style={{ height: '16px', width: '150px', background: '#eee' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ShowFavoritesJobs;
