import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ShowListedJobs.module.css";

// Icons
import { Settings, Plus, ArrowLeft } from "lucide-react";

// Shared Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

// API
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi";

const ShowListedJobs: React.FC = () => {
    const navigate = useNavigate();
    const [ads, setAds] = useState<CompanyAdvertisement[]>([]);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const data = await getCompanyAdvertisements();
                if (data.success) {
                    setAds(data.advertisements);
                }
            } catch (err) {
                console.error("Hirdetések lekérése sikertelen:", err);
            }
        };
        fetchAds();
    }, []);

    const handleEditClick = (e: React.MouseEvent, adId: number) => {
        e.stopPropagation();
        navigate(`/company/edit/${adId}`);
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <BannerKicker>Kezelés</BannerKicker>
                        <h1 className={styles.title}>Aktuális hirdetései</h1>
                    </div>
                    <div className={styles.actions}>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/company")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ArrowLeft size={18} /> Vissza
                            </div>
                        </Button>
                        <Button
                            color="orion-blue"
                            onClick={() => navigate("/AddJob")}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Plus size={18} /> Hirdetés hozzáadása
                            </div>
                        </Button>
                    </div>
                </header>

                <div className={styles.jobList}>
                    {ads.length > 0 ? (
                        ads.map((ad) => (
                            <div
                                key={ad.id}
                                className={styles.jobCard}
                                onClick={() => navigate(`/company/ATS/${ad.id}`)}
                            >
                                <div className={styles.jobMainInfo}>
                                    <h2>{ad.title}</h2>
                                    <p className={styles.jobSubInfo}>{ad.position}</p>
                                </div>

                                <div className={styles.controls}>
                                    <span className={styles.statusBadge}>Aktív</span>
                                    <button
                                        className={styles.editButton}
                                        onClick={(e) => handleEditClick(e, ad.id)}
                                        title="Szerkesztés"
                                    >
                                        <Settings size={20}/>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.jobSubInfo}>Nincsenek megjeleníthető hirdetések.</p>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ShowListedJobs;