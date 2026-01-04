import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, Hash, Wallet, ClipboardList, Target, Briefcase, ChevronLeft } from "lucide-react";
import {
    updateviewcounter,
    getAdvertisementById,
    submitApplication,
    type AdvertisementDetails,
    ApiError
} from "../../../../services/advertisementService";
import styles from "./ShowJob.module.css";

//components
import { Header } from "../../../../components/Header/Header.tsx";
import Button from "../../../../components/Button/Button.tsx";
import BannerKicker from "../../../../components/BannerKicker/BannerKicker.tsx";
import Footer from "../../../../components/Footer/Footer.tsx";

const ShowJob = () => {
    const { id } = useParams();
    const [advertisement, setAdvertisement] = useState<AdvertisementDetails | null>(null);
    const [loading, setLoading] = useState(true); // Used only for initial page load
    const [isSubmitting, setIsSubmitting] = useState(false); // Used for application submission
    const [error, setError] = useState<string | null>(null);
    const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const key = `viewed_ad_${id}`;
        const fetchAdvertisement = async () => {
            if (!id) return;
            try {
                const data = await getAdvertisementById(id);
                if (data.success) {
                    setAdvertisement(data.advertisement);
                    // Update view counter after successful fetch
                    try {
                        if (!sessionStorage.getItem(key)) {
                            sessionStorage.setItem(key, "true");
                            await updateviewcounter(id);
                        }
                    } catch (err) {
                        console.error("View counter update failed", err);
                    }

                } else {
                    setError(data.error || "Az állás betöltése sikertelen.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Hiba történt az állás betöltése során.");
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisement();
    }, [id]);

    const handleSubmitApplication = async () => {
        if (!id) return;

        setIsSubmitting(true);
        setApplicationStatus(null);

        const startTime = Date.now();
        const MIN_DELAY = 1000;

        let finalStatus = "";

        try {
            const data = await submitApplication(id);

            if (data.success) {
                finalStatus = "Sikeres jelentkezés!";
            } else {
                finalStatus = data.error || "A jelentkezés sikertelen.";
            }
        } catch (err) {
            console.error("Submit application error:", err);
            if (err instanceof ApiError && err.status === 409) {
                finalStatus = "Már jelentkeztél!";
            } else {
                finalStatus = "Hiba történt a jelentkezés során.";
            }
        } finally {
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_DELAY - elapsedTime);
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            setApplicationStatus(finalStatus);
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.pageWrapper}>
                <Header />
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <p>Betöltés...</p>
                </div>
            </div>
        );
    }

    if (error || !advertisement) {
        return (
            <div className={styles.pageWrapper}>
                <Header />
                <div style={{ textAlign: 'center', padding: '100px' }}>
                    <p>{error || "Nem található hirdetés."}</p>
                    <Button
                        type="button"
                        color="orion-blue"
                        variant="secondary"
                        onClick={() => navigate("/listjobs")}
                    >
                        Vissza a listához
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <header className={styles.banner}>
                <div className={styles.bannerInner}>
                    <button onClick={() => navigate("/listjobs")} className={styles.backButton}>
                        <ChevronLeft size={16} /> Vissza a böngészéshez
                    </button>
                    <BannerKicker>Részletes megtekintés</BannerKicker>
                    <h1 className={styles.bannerTitle}>{advertisement.title}</h1>
                    <div className={styles.bannerMeta}>
                        <Briefcase size={18} />
                        <span>Munkakör: <strong>{advertisement.position}</strong></span>
                    </div>
                </div>
            </header>

            <main className={styles.contentContainer}>
                <div className={styles.detailsCard}>
                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <ClipboardList size={22} className={styles.iconBlue} />
                            Munkaköri leírás
                        </h2>
                        <div className={styles.richText}>
                            {advertisement.job_description}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Target size={22} className={styles.iconBlue} />
                            Főbb feladatok
                        </h2>
                        <div className={styles.richText}>
                            {advertisement.tasks}
                        </div>
                    </section>

                    <section className={styles.section}>
                        <h2 className={styles.sectionTitle}>
                            <Briefcase size={22} className={styles.iconBlue} />
                            Elvárások
                        </h2>
                        <div className={styles.tagCloud}>
                            {advertisement.requirements.split(',').map((req, index) => (
                                <span key={index} className={styles.tag}>{req.trim()}</span>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.actionCard}>
                        <div className={styles.priceHeader}>
                            <Wallet size={24} className={styles.iconBlue} />
                            <div>
                                <div className={styles.priceTag}>{advertisement.hourly_wage} Ft</div>
                                <span className={styles.mutedSmall}>Bruttó órabér</span>
                            </div>
                        </div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>
                                    <MapPin size={16} /> Helyszín
                                </div>
                                <span className={styles.value}>{advertisement.location}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <div className={styles.infoLabel}>
                                    <Hash size={16} /> Referencia
                                </div>
                                <span className={styles.value}>#{id}</span>
                            </div>
                        </div>

                        <div className={styles.buttonGroup}>
                            <Button
                                type="button"
                                color="orion-blue"
                                variant="primary"
                                onClick={handleSubmitApplication}
                                className={styles.applyBtn}
                                disabled={isSubmitting} // Disable to prevent multiple clicks
                            >
                                {isSubmitting ? "Jelentkezés..." : "Jelentkezés most"}
                            </Button>
                        </div>

                        {applicationStatus && (
                            <div className={styles.statusMsg}>
                                {applicationStatus}
                            </div>
                        )}
                    </div>

                    <div className={styles.trustCard}>
                        <p>Kérdése van? Keressen minket bizalommal az Orion ügyfélszolgálatán.</p>
                    </div>
                </aside>
            </main>
            <Footer></Footer>
        </div>
    );
};

export default ShowJob;