import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Briefcase,
    Clock,
    Calendar,
    ArrowLeft,
    ClipboardCheck,
    AlertCircle
} from "lucide-react";
import { getJobApplications, type JobApplicationData } from "../../../api/advertisementApi.ts";
import styles from "./JobApplications.module.css";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

const JobApplications = () => {
    const { t } = useTranslation('user');
    const [submits, setSubmits] = useState<JobApplicationData[]>([]);
    const [works, setWorks] = useState<JobApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getJobApplications();
                setSubmits(data.submit || []);
                setWorks(data.work || []);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : t('jobApplications.networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [t]);

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.container}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>{t('jobApplications.loading')}</p>
                    </div>
                ) : error ? (
                    <div className={styles.loadingState}>
                        <AlertCircle size={48} color="red" />
                        <p style={{ color: "red", marginTop: "16px" }}>{error}</p>
                        <Button onClick={() => window.location.reload()} color="orion-blue">{t('jobApplications.retry')}</Button>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <div className={styles.titleGroup}>
                                <BannerKicker>{t('jobApplications.header.kicker')}</BannerKicker>
                                <h1>{t('jobApplications.header.title')}</h1>
                                <p>{t('jobApplications.header.subtitle')}</p>
                            </div>
                            <Button
                                variant="secondary"
                                color="orion-blue"
                                onClick={() => navigate("/userhomepage")}
                            >
                                <ArrowLeft size={18} style={{marginRight: '8px'}} /> {t('jobApplications.header.back')}
                            </Button>
                        </div>

                        {/* Works Section */}
                        <section className={styles.sectionCard}>
                            <h2 className={styles.cardTitle}>
                                <Briefcase size={22} /> {t('jobApplications.works.title')}
                            </h2>
                            {works.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('jobApplications.works.empty')}</p>
                                </div>
                            ) : (
                                <div className={styles.listContainer}>
                                    {works.map((work) => (
                                        <div key={work.id} className={styles.itemRow}>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>{t('jobApplications.works.position')}</span>
                                                <span className={styles.infoValue}>{work.job_title} ({work.position})</span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>{t('jobApplications.works.company')}</span>
                                                <span className={styles.infoValue}>
                                                    {work.company?.name}
                                                </span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>{t('jobApplications.works.wage')}</span>
                                                <span className={styles.infoValue}>
                                                    {work.hourly_wage} Ft
                                                </span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>{t('jobApplications.works.hireDate')}</span>
                                                <span className={styles.infoValue}>
                                                    <Calendar size={14} style={{display: 'inline', marginRight: '4px'}} />
                                                    {new Date(work.hire_date!).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Submissions Section */}
                        <section className={styles.sectionCard}>
                            <h2 className={styles.cardTitle}>
                                <ClipboardCheck size={22} /> {t('jobApplications.submissions.title')}
                            </h2>
                            {submits.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>{t('jobApplications.submissions.empty')}</p>
                                </div>
                            ) : (
                                <div className={styles.listContainer}>

                                    {submits.map((submit) => {
                                        const statusClass = submit.status?.toLowerCase() === 'rejected'
                                            ? styles.statusRejected
                                            : styles.statusDefault;

                                        return (
                                            <div key={submit.id} className={styles.itemRow}>
                                                <div className={styles.infoBlock}>
                                                    <span className={styles.infoLabel}>{t('jobApplications.submissions.advertisement')}</span>
                                                    <span className={styles.infoValue}>{submit.advertisement?.title}</span>
                                                </div>

                                                <div className={`${styles.infoBlock} ${styles.centeredInfo}`}>
                                                    <span className={styles.infoLabel}>{t('jobApplications.submissions.status')}</span>
                                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                                        {submit.status}
                                                    </span>
                                                </div>

                                                <div className={styles.infoBlock} style={{gridColumn: 'span 2'}}>
                                                    <span className={styles.infoLabel}>{t('jobApplications.submissions.lastUpdated')}</span>
                                                    <span className={styles.infoValue}>
                                                        <Clock size={14} style={{display: 'inline', marginRight: '4px'}} />
                                                        {new Date(submit.last_updated!).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default JobApplications;