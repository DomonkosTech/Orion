import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./ShowListedJobs.module.css";

// Icons
import { Settings, Plus, ArrowLeft } from "lucide-react";

// Shared Components
import { Header } from "../../../components/layout/Header/Header.tsx";
import Button from "../../../components/ui/Button/Button.tsx";
import Footer from "../../../components/layout/Footer/Footer.tsx";
import BannerKicker from "../../../components/layout/BannerKicker/BannerKicker.tsx";

// API
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi";

const ShowListedJobs: React.FC = () => {
    const { t } = useTranslation('company');
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
                console.error(t('showJobs.fetchError'), err);
            }
        };
        fetchAds();
    }, []);

    const handleEditClick = (e: React.MouseEvent, adId: number) => {
        e.stopPropagation();
        navigate(`/company/edit/${adId}`);
    };

    return (
        <>
            <Header />
            <div className={styles.page}>

                <main className={styles.container}>
                    <header className={styles.header}>
                        <div>
                            <BannerKicker>{t('showJobs.banner')}</BannerKicker>
                            <h1 className={styles.title}>{t('showJobs.title')}</h1>
                            <p className={styles.usageCounter}>
                                {t('showJobs.currentUsage', { current: ads.length, max: 3 })}
                            </p>
                        </div>
                        <div className={styles.actions}>
                            <Button
                                variant="secondary"
                                onClick={() => navigate(-1)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <ArrowLeft size={18} /> {t('showJobs.back')}
                                </div>
                            </Button>
                            <Button
                                color="orion-blue"
                                onClick={() => navigate("/AddJob")}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Plus size={18} /> {t('showJobs.add')}
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
                                        <div className={styles.jobDetailsRow}>
                                            <p className={styles.jobSubInfo}>{ad.position}</p>
                                            <span className={styles.cardHint}>{t('showJobs.viewApplicants')}</span>
                                        </div>
                                    </div>

                                    <div className={styles.controls}>
                                        <span className={ad.is_active ? styles.statusBadge : styles.statusBadgeInactive}>{ad.is_active ? t('showJobs.active') : t('showJobs.inactive')}</span>
                                        <button
                                            className={styles.editButton}
                                            onClick={(e) => handleEditClick(e, ad.id)}
                                            title={t('showJobs.edit')}
                                        >
                                            <Settings size={20}/>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.jobSubInfo}>{t('showJobs.noJobs')}</p>
                        )}
                    </div>
                </main>

            </div>
            <Footer/>
        </>
    );
};

export default ShowListedJobs;