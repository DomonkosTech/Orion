import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Briefcase, MapPin, AlignLeft,
    CheckCircle, AlertCircle, Save, XCircle, Edit3, ArrowLeft
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import {
    getAdvertisementForEdit,
    updateAdvertisement,
    updateAdvertisementStatus,
    type UpdateAdvertisementData
} from "../../../Api/advertisementApi.ts";

import styles from "./EditJob.module.css";

// Shared Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import InputField from "../../../components/InputField/InputField.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";

const EditJob: React.FC = () => {
    const { t } = useTranslation('company');
    const { id } = useParams();
    const navigate = useNavigate();

    const [advertisement, setAdvertisement] = useState<UpdateAdvertisementData | null>(null);
    const [originalData, setOriginalData] = useState<UpdateAdvertisementData | null>(null);

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchAdvertisement = async () => {
            if (!id) return;
            try {
                const data = await getAdvertisementForEdit(id);
                if (data.success) {
                    setAdvertisement(data.advertisement);
                    setOriginalData(data.advertisement);
                }
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error(t('editJob.notifications.loadError'));
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisement();
    }, [id]);

    const handleSave = async () => {
        if (!id || !advertisement) return;
        setIsSaving(true);
        try {
            const data = await updateAdvertisement(id, advertisement);
            if (data.success) {
                setOriginalData(advertisement);
                setEditMode(false);
                toast.success(t('editJob.notifications.saveSuccess'));
                navigate("/company");
            }
        } catch (err) {
            console.error(err);
            toast.error(t('editJob.notifications.saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setAdvertisement(originalData);
        setEditMode(false);
    };

    const handleStatusChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!id || !advertisement) return;
        const newStatus = e.target.checked;
        try {
            const data = await updateAdvertisementStatus(id, newStatus);
            if (data.success) {
                setAdvertisement({ ...advertisement, is_active: newStatus });
                setOriginalData(prev => prev ? { ...prev, is_active: newStatus } : null);
                toast.success(newStatus ? t('editJob.notifications.statusActive') : t('editJob.notifications.statusInactive'));
            }
        } catch (err) {
            console.error(err);
            toast.error(t('editJob.notifications.statusError'));
        }
    };

    if (loading) return (
        <div className={styles.pageWrapper}>
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>{t('editJob.loading')}</p>
            </div>
        </div>
    );

    if (!advertisement) return <p>{t('editJob.notFound')}</p>;

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <Toaster />

            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.titleGroup}>
                        <BannerKicker>{t('editJob.banner')}</BannerKicker>
                        <h1>{t('editJob.title')}</h1>
                        <p>{t('editJob.subtitle')}</p>
                    </div>

                    <div className={styles.actionGroup}>
                        {!editMode ? (
                            <>
                                <Button onClick={() => navigate("/company")} variant="secondary">
                                    <ArrowLeft size={18} style={{marginRight: '8px'}} /> {t('editJob.actions.back')}
                                </Button>
                                <Button onClick={() => setEditMode(true)} color="orion-blue">
                                    <Edit3 size={18} style={{marginRight: '8px'}} /> {t('editJob.actions.edit')}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button onClick={handleCancel} variant="secondary">
                                    <XCircle size={18} style={{marginRight: '8px'}} /> {t('editJob.actions.cancel')}
                                </Button>
                                <Button onClick={handleSave} color="orion-blue" isLoading={isSaving}>
                                    <Save size={18} style={{marginRight: '8px'}} /> {t('editJob.actions.save')}
                                </Button>
                            </>
                        )}
                    </div>
                </header>

                <form className={styles.mainLayout}>
                    <div className={styles.contentArea}>
                        {/* Basic Info Card */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><Briefcase size={22} /> {t('editJob.sections.position.title')}</h2>
                            <div className={styles.inputGrid}>
                                <InputField
                                    label={t('editJob.sections.position.jobTitle')}
                                    value={advertisement.title}
                                    readOnly={!editMode}
                                    onChange={(e) => setAdvertisement({...advertisement, title: e.target.value})}
                                    containerClassName={styles.fullWidth}
                                    placeholder={t('editJob.sections.position.jobTitlePlaceholder')}
                                />
                                <InputField
                                    label={t('editJob.sections.position.position')}
                                    value={advertisement.position}
                                    readOnly={!editMode}
                                    onChange={(e) => setAdvertisement({...advertisement, position: e.target.value})}
                                    placeholder={t('editJob.sections.position.positionPlaceholder')}
                                />
                                <InputField
                                    label={<>{t('editJob.sections.position.hourlyWage')}</>}
                                    value={advertisement.hourly_wage}
                                    readOnly={!editMode}
                                    onChange={(e) => setAdvertisement({...advertisement, hourly_wage: e.target.value})}
                                    placeholder={t('editJob.sections.position.hourlyWagePlaceholder')}
                                />
                                <InputField
                                    label={<><MapPin size={14} style={{marginRight: '4px'}}/> {t('editJob.sections.position.location')}</>}
                                    value={advertisement.location}
                                    readOnly={!editMode}
                                    onChange={(e) => setAdvertisement({...advertisement, location: e.target.value})}
                                    containerClassName={styles.fullWidth}
                                    placeholder={t('editJob.sections.position.locationPlaceholder')}
                                />

                            </div>
                        </section>

                        {/* Description Card */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><AlignLeft size={22} /> {t('editJob.sections.content.title')}</h2>
                            <div className={styles.contentGrid}>
                                <TextArea
                                    label={t('editJob.sections.content.description')}
                                    value={advertisement.job_description}
                                    readOnly={!editMode}
                                    onChange={(e) => setAdvertisement({...advertisement, job_description: e.target.value})}
                                    placeholder={t('editJob.sections.content.descriptionPlaceholder')}
                                    rows={3} // Reduced height
                                />

                                {/* New nested grid for side-by-side text areas */}
                                <div className={styles.textAreaSecondaryGrid}>
                                    <TextArea
                                        label={t('editJob.sections.content.tasks')}
                                        value={advertisement.tasks}
                                        readOnly={!editMode}
                                        onChange={(e) => setAdvertisement({...advertisement, tasks: e.target.value})}
                                        rows={4} // Reduced from 6
                                        placeholder={t('editJob.sections.content.tasksPlaceholder')}
                                    />
                                    <TextArea
                                        label={t('editJob.sections.content.requirements')}
                                        value={advertisement.requirements}
                                        readOnly={!editMode}
                                        onChange={(e) => setAdvertisement({...advertisement, requirements: e.target.value})}
                                        rows={4} // Reduced from 6
                                        placeholder={t('editJob.sections.content.requirementsPlaceholder')}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <aside className={styles.sidebar}>
                        {/* Status Card */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><AlertCircle size={22} /> {t('editJob.sections.status.title')}</h2>
                            <div className={styles.statusCard}>
                                <div className={`${styles.statusBadge} ${advertisement.is_active ? styles.statusActive : styles.statusInactive}`}>
                                    {advertisement.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                    {advertisement.is_active ? t('editJob.sections.status.active') : t('editJob.sections.status.inactive')}
                                </div>
                                
                                <div className={styles.statusToggle}>
                                    <div className={styles.statusInfo}>
                                        <h3>{t('editJob.sections.status.visibility')}</h3>
                                        <p>{advertisement.is_active ? t('editJob.sections.status.public') : t('editJob.sections.status.hidden')}</p>
                                    </div>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={advertisement.is_active}
                                            onChange={handleStatusChange}
                                        />
                                        <span className={styles.slider}></span>
                                    </label>
                                </div>
                            </div>
                        </section>

                        <section className={styles.card}>
                            <h3 style={{fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)'}}>{t('editJob.sections.info.title')}</h3>
                            <p style={{fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5'}}>
                                {t('editJob.sections.info.text')}
                            </p>
                        </section>
                    </aside>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default EditJob;