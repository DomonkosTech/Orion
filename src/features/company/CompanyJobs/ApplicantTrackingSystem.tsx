import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, Toaster } from "react-hot-toast";
import styles from "./ApplicantTrackingSystem.module.css";

// Icons
import { FileText, Check, X, ArrowLeft, Mail, Calendar, MapPin } from "lucide-react";

// Shared Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";

import {
    getApplicantsForAdvertisement,
    acceptApplication,
    rejectApplication,
    getResumeUrl,
    type Applicant
} from "../../../api/applicationApi.ts";

export const ApplicantTrackingSystem: React.FC = () => {
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!id) {
                setLoading(false);
                setError("Nincs hirdetés azonosító megadva.");
                console.error(error)
                return;
            }
            try {
                const data = await getApplicantsForAdvertisement(id);
                if (data.success) {
                    setApplicants(data.applicants);
                } else {
                    setError(data.error || "Hiba a jelentkezők lekérésekor.");
                }
            } catch (err) {
                console.error(err)
                setError("Hálózati hiba vagy a szerver nem elérhető.");
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [id]);

    const handleAccept = async (applicationId: number) => {
        try {
            const data = await acceptApplication(applicationId);
            if (data.success) {
                toast.success("Sikeresen elfogadva");
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
            }
        } catch (err) {
            console.error(err)
            toast.error("Hiba történt.");
        }
    };

    const handleDownloadResume = async (applicationId: number) => {
        try {
            const data = await getResumeUrl(applicationId);
            if (data.success) {
                window.open(data.url, '_blank');
            }
        } catch (err) {
            console.error(err)
            toast.error("Az önéletrajz nem elérhető");
        }
    };

    const handleReject = async (applicationId: number) => {
        try {
            const data = await rejectApplication(applicationId);
            if (data.success) {
                toast.success("Sikeresen elutasítva");
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
            }
        } catch (err) {
            console.error(err)
            toast.error("Hiba történt.");
        }
    };

    if (loading) return <div className={styles.page}><Header /><p className={styles.emptyState}>Betöltés...</p></div>;

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <BannerKicker>Toborzás</BannerKicker>
                        <h1 className={styles.title}>Jelentkezők kezelése</h1>
                        {applicants.length > 0 && (
                            <div className={styles.statsCounter}>
                                Megtekintések száma: {applicants[0].click_count?.click_count ?? 0}
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> Vissza
                    </Button>
                </header>

                <Toaster />

                <div className={styles.applicantList}>
                    {applicants.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>Nincsenek új jelentkezők ehhez a hirdetéshez.</p>
                        </div>
                    ) : (
                        applicants.map((applicant) => (
                            <div key={applicant.id} className={styles.applicantCard}>
                                <div className={styles.infoGroup}>
                                    <h2 className={styles.name}>{applicant.users.lname} {applicant.users.fname}</h2>
                                    <div className={styles.details}>
                                        <span className={styles.detailItem}><Mail size={14} /> {applicant.users.email}</span>
                                        <span className={styles.detailItem}><Calendar size={14} /> {new Date(applicant.users.birth_date).toLocaleDateString()}</span>
                                        <span className={styles.detailItem}><MapPin size={14} /> {applicant.users.birth_place}</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleDownloadResume(applicant.id)}
                                        className={`${styles.btn} ${styles.btnDownload}`}
                                    >
                                        <FileText size={16} /> CV
                                    </button>
                                    <Button
                                        color={"leaf-green"}
                                        onClick={() => handleAccept(applicant.id)}
                                    >
                                        <Check size={16} /> Felvétel
                                    </Button>
                                    <Button
                                        color={"fire-red"}
                                        onClick={() => handleReject(applicant.id)}
                                    >
                                        <X size={16} /> Elutasítás
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ApplicantTrackingSystem;