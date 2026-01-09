import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import {
    Briefcase,
    Clock,
    Calendar,
    ArrowLeft,
    ClipboardCheck,
    AlertCircle
} from "lucide-react";
import { getJobApplications, type JobApplicationData } from "../../../services/advertisementService";
import styles from "./JobApplications.module.css";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

const JobApplications = () => {
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
                setError(err instanceof Error ? err.message : "Hálózati hiba történt");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.container}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Adatok betöltése...</p>
                    </div>
                ) : error ? (
                    <div className={styles.loadingState}>
                        <AlertCircle size={48} color="red" />
                        <p style={{ color: "red", marginTop: "16px" }}>{error}</p>
                        <Button onClick={() => window.location.reload()} color="orion-blue">Próbálja újra</Button>
                    </div>
                ) : (
                    <>
                        {/* Header Section */}
                        <div className={styles.headerSection}>
                            <div className={styles.titleGroup}>
                                <BannerKicker>Munkaviszonyok</BannerKicker>
                                <h1>Munkáim & Jelentkezéseim</h1>
                                <p>Kövesd nyomon aktuális munkáidat és a leadott jelentkezéseid állapotát.</p>
                            </div>
                            <Button
                                variant="secondary"
                                color="orion-blue"
                                onClick={() => navigate("/userhomepage")}
                            >
                                <ArrowLeft size={18} style={{marginRight: '8px'}} /> Vissza
                            </Button>
                        </div>

                        {/* Works Section */}
                        <section className={styles.sectionCard}>
                            <h2 className={styles.cardTitle}>
                                <Briefcase size={22} /> Aktuális Munkáim
                            </h2>
                            {works.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>Nincs aktív munkád jelenleg.</p>
                                </div>
                            ) : (
                                <div className={styles.listContainer}>
                                    {works.map((work) => (
                                        <div key={work.id} className={styles.itemRow}>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>Pozíció</span>
                                                <span className={styles.infoValue}>{work.job_title} ({work.position})</span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>Cég</span>
                                                <span className={styles.infoValue}>
                                                    {work.company?.name}
                                                </span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>Órabér</span>
                                                <span className={styles.infoValue}>
                                                    {work.hourly_wage} Ft
                                                </span>
                                            </div>
                                            <div className={styles.infoBlock}>
                                                <span className={styles.infoLabel}>Belépés</span>
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
                                <ClipboardCheck size={22} /> Jelentkezéseim Státusza
                            </h2>
                            {submits.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <p>Még nem jelentkeztél egy hirdetésre sem.</p>
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
                                                    <span className={styles.infoLabel}>Hirdetés</span>
                                                    <span className={styles.infoValue}>{submit.advertisement?.title}</span>
                                                </div>

                                                <div className={`${styles.infoBlock} ${styles.centeredInfo}`}>
                                                    <span className={styles.infoLabel}>Státusz</span>
                                                    <span className={`${styles.statusBadge} ${statusClass}`}>
                                                        {submit.status}
                                                    </span>
                                                </div>

                                                <div className={styles.infoBlock} style={{gridColumn: 'span 2'}}>
                                                    <span className={styles.infoLabel}>Utolsó frissítés</span>
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