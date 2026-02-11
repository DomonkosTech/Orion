import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ApplicantTrackingSystem.module.css";

// Icons
import { FileText, Check, X, ArrowLeft, Mail, Calendar, MapPin, User, Briefcase, GraduationCap, Globe } from "lucide-react";

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
} from "../../../Api/applicationApi.ts";

export const ApplicantTrackingSystem: React.FC = () => {
    const { t } = useTranslation('company');
    const navigate = useNavigate();
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null);

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!id) {
                setLoading(false);
                setError(t('ats.notifications.noId'));
                console.error(error)
                return;
            }
            try {
                const data = await getApplicantsForAdvertisement(id);
                if (data.success) {
                    setApplicants(data.applicants);
                } else {
                    setError(data.error || t('ats.notifications.fetchError'));
                }
            } catch (err) {
                console.error(err)
                setError(t('ats.notifications.networkError'));
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [id]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedApplicantId(null);
            }
        };

        if (selectedApplicantId) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedApplicantId]);

    const handleAccept = async (applicationId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const data = await acceptApplication(applicationId);
            if (data.success) {
                toast.success(t('ats.notifications.acceptSuccess'));
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
                if (selectedApplicantId === applicationId) setSelectedApplicantId(null);
            }
        } catch (err) {
            console.error(err)
            toast.error(t('ats.notifications.actionError'));
        }
    };

    const handleDownloadResume = async (applicationId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const data = await getResumeUrl(applicationId);
            if (data.success) {
                window.open(data.url, '_blank');
            }
        } catch (err) {
            console.error(err)
            toast.error(t('ats.notifications.cvError'));
        }
    };

    const handleReject = async (applicationId: number, e?: React.MouseEvent) => {
        e?.stopPropagation();
        try {
            const data = await rejectApplication(applicationId);
            if (data.success) {
                toast.success(t('ats.notifications.rejectSuccess'));
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
                if (selectedApplicantId === applicationId) setSelectedApplicantId(null);
            }
        } catch (err) {
            console.error(err)
            toast.error(t('ats.notifications.actionError'));
        }
    };

    if (loading) return <div className={styles.page}><Header /><p className={styles.emptyState}>{t('ats.loading')}</p></div>;

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.container}>
                <header className={styles.header}>
                    <div>
                        <BannerKicker>{t('ats.banner')}</BannerKicker>
                        <h1 className={styles.title}>{t('ats.title')}</h1>
                        {applicants.length > 0 && (
                            <div className={styles.statsCounter}>
                                {t('ats.views')} {applicants[0].click_count?.click_count ?? 0}
                            </div>
                        )}
                    </div>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} /> {t('ats.back')}
                    </Button>
                </header>

                <Toaster />

                <div className={styles.applicantList}>
                    {applicants.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>{t('ats.empty')}</p>
                        </div>
                    ) : (
                        applicants.map((applicant) => (
                            <motion.div
                                layoutId={`card-${applicant.id}`}
                                key={applicant.id}
                                className={styles.applicantCard}
                                onClick={() => setSelectedApplicantId(applicant.id)}
                                whileHover={{ scale: 1.01 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            >
                                <div className={styles.infoGroup}>
                                    <motion.h2 layoutId={`name-${applicant.id}`} className={styles.name}>
                                        {applicant.users.lname} {applicant.users.fname}
                                    </motion.h2>
                                    <div className={styles.details}>
                                        <span className={styles.detailItem}><Mail size={14} /> {applicant.users.email}</span>
                                        <span className={styles.detailItem}><Calendar size={14} /> {new Date(applicant.users.birth_date).toLocaleDateString()}</span>
                                        <span className={styles.detailItem}><MapPin size={14} /> {applicant.users.birth_place}</span>
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        onClick={(e) => handleDownloadResume(applicant.id, e)}
                                        className={`${styles.btn} ${styles.btnDownload}`}
                                    >
                                        <FileText size={16} /> {t('ats.actions.cv')}
                                    </button>
                                    <Button
                                        color={"leaf-green"}
                                        onClick={(e) => handleAccept(applicant.id, e)}
                                    >
                                        <Check size={16} /> {t('ats.actions.accept')}
                                    </Button>
                                    <Button
                                        color={"fire-red"}
                                        onClick={(e) => handleReject(applicant.id, e)}
                                    >
                                        <X size={16} /> {t('ats.actions.reject')}
                                    </Button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>

            <AnimatePresence>
                {selectedApplicantId && (
                    <>
                        <motion.div
                            className={styles.overlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            onClick={() => setSelectedApplicantId(null)}
                        />
                        {applicants.filter(a => a.id === selectedApplicantId).map(applicant => (
                            <motion.div
                                layoutId={`card-${applicant.id}`}
                                className={styles.expandedCard}
                                key={applicant.id}
                                transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                            >
                                <div className={styles.expandedHeader}>
                                    <button className={styles.closeBtn} onClick={() => setSelectedApplicantId(null)}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <motion.div 
                                    className={styles.expandedBody}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15, duration: 0.4, ease: "easeOut" }}
                                >
                                    {/* Left Panel: Personal Info */}
                                    <div className={styles.leftPanel}>
                                        <div className={styles.avatarSection}>
                                            <div className={styles.avatar}>
                                                {applicant.users.fname[0]}{applicant.users.lname[0]}
                                            </div>
                                            <motion.h2 layoutId={`name-${applicant.id}`} className={styles.panelTitle}>
                                                {applicant.users.lname} {applicant.users.fname}
                                            </motion.h2>
                                            <span className={styles.panelSubtitle}>{applicant.users.nationality}</span>
                                        </div>

                                        <div className={styles.infoSection}>
                                            <div className={styles.sectionHeader}>
                                                <User size={14} /> {t('ats.details.contact')}
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>{t('ats.details.email')}</span>
                                                <span className={styles.infoValue}>{applicant.users.email}</span>
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>{t('ats.details.phone')}</span>
                                                <span className={styles.infoValue}>{applicant.users.phone_number}</span>
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>{t('ats.details.address')}</span>
                                                <span className={styles.infoValue}>{applicant.users.address}</span>
                                            </div>
                                        </div>

                                        <div className={styles.infoSection}>
                                            <div className={styles.sectionHeader}>
                                                <Globe size={14} /> {t('ats.details.personal')}
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>{t('ats.details.birthDate')}</span>
                                                <span className={styles.infoValue}>{new Date(applicant.users.birth_date).toLocaleDateString()}</span>
                                            </div>
                                            <div className={styles.infoRow}>
                                                <span className={styles.infoLabel}>{t('ats.details.birthPlace')}</span>
                                                <span className={styles.infoValue}>{applicant.users.birth_place}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: Content */}
                                    <div className={styles.rightPanel}>
                                        <div className={styles.contentCard}>
                                            <h3 className={styles.contentTitle}>
                                                <GraduationCap size={20} />
                                                {t('ats.details.qualifications')}
                                            </h3>
                                            <p className={styles.contentText}>{applicant.users.qualifications}</p>
                                        </div>

                                        <div className={styles.contentCard}>
                                            <h3 className={styles.contentTitle}>
                                                <Briefcase size={20} />
                                                {t('ats.details.bio')}
                                            </h3>
                                            <p className={styles.contentText}>{applicant.users.short_bio}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className={styles.expandedActions}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    <button
                                        onClick={(e) => handleDownloadResume(applicant.id, e)}
                                        className={`${styles.btn} ${styles.btnDownload}`}
                                    >
                                        <FileText size={16} /> {t('ats.actions.cv')}
                                    </button>
                                    <Button
                                        color={"leaf-green"}
                                        onClick={(e) => handleAccept(applicant.id, e)}
                                    >
                                        <Check size={16} /> {t('ats.actions.accept')}
                                    </Button>
                                    <Button
                                        color={"fire-red"}
                                        onClick={(e) => handleReject(applicant.id, e)}
                                    >
                                        <X size={16} /> {t('ats.actions.reject')}
                                    </Button>
                                </motion.div>
                            </motion.div>
                        ))}
                    </>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};

export default ApplicantTrackingSystem;