import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createAdvertisement } from "../../../Api/advertisementApi";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import styles from "./AddJob.module.css";

// Components
import { Header } from "../../../components/layout/Header/Header.tsx";
import Footer from "../../../components/layout/Footer/Footer.tsx";
import BannerKicker from "../../../components/layout/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/ui/Button/Button.tsx";
import TextArea from "../../../components/ui/TextArea/TextArea.tsx";
import InputField from "../../../components/ui/InputField/InputField.tsx";
import Checkbox from "../../../components/ui/Checkbox/Checkbox.tsx";

const AddJob: React.FC = () => {
    const { t } = useTranslation('company');
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        position: "",
        location: "",
        hourly_wage: "",
        tasks: "",
        requirements: "",
        job_description: "",
        job_type: "Full-time",
        category: "Physical Work",
        is_active: true,
    });

    //
    //
    //saknasfjiewhjie2ndjdjfekbfie2fdnejfheifne3n
    //      NEM MŰKÖDIK!!!!!!!!!
    //      Kell hozzá még több BACKEND
    //923u4ö92hejifnwcmfsdjfsddnfksadnoskdsqidjwq
    //
    //
    //

    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.position.trim() || !formData.location.trim() || !formData.hourly_wage.trim()) {
            toast.error(t('addJob.validation.requiredFields'));
            return;
        }

        setIsLoading(true);
        try {
            await createAdvertisement({
                ...formData,
                hourly_wage: parseFloat(formData.hourly_wage),
            });
            toast.success(t('addJob.validation.success'));
            navigate("/company");
        } catch {
            toast.error(t('addJob.validation.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />

            <main className={styles.container}>
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <BannerKicker>{t('addJob.banner')}</BannerKicker>
                        <h1 className={styles.title}>{t('addJob.title')}</h1>
                        <p className={styles.subtitle}>{t('addJob.subtitle')}</p>
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
                    </div>
                </header>

                <form onSubmit={handleSubmit} className={styles.layout}>
                    {/* Main Content Area */}
                    <div className={styles.mainContent}>

                        {/* Section 1: Alapadatok */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><span>1</span> {t('addJob.sections.basicInfo.title')}</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <InputField
                                        label={t('addJob.sections.basicInfo.jobTitle')}
                                        name="title"
                                        placeholder={t('addJob.sections.basicInfo.jobTitlePlaceholder')}
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <InputField
                                    label={t('addJob.sections.basicInfo.position')}
                                    name="position"
                                    placeholder={t('addJob.sections.basicInfo.positionPlaceholder')}
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    required
                                 />
                                <InputField
                                    label={t('addJob.sections.basicInfo.location')}
                                    name="location"
                                    placeholder={t('addJob.sections.basicInfo.locationPlaceholder')}
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </section>

                        {/* Section 2: Részletek & Leírás */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><span>2</span> {t('addJob.sections.details.title')}</h2>
                            <div className={styles.stackedInputs}>
                                <TextArea
                                    label={t('addJob.sections.details.description')}
                                    name="job_description"
                                    placeholder={t('addJob.sections.details.descriptionPlaceholder')}
                                    rows={5}
                                    value={formData.job_description}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.formGrid}>
                                    <TextArea
                                        label={t('addJob.sections.details.tasks')}
                                        name="tasks"
                                        placeholder={t('addJob.sections.details.tasksPlaceholder')}
                                        rows={4}
                                        value={formData.tasks}
                                        onChange={handleInputChange}
                                    />
                                    <TextArea
                                        label={t('addJob.sections.details.requirements')}
                                        name="requirements"
                                        placeholder={t('addJob.sections.details.requirementsPlaceholder')}
                                        rows={4}
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <aside className={styles.sidebar}>
                        <div className={`${styles.card} ${styles.stickyCard}`}>
                            <h3 className={styles.sidebarTitle}>{t('addJob.sidebar.title')}</h3>

                            <div className={styles.sidebarInputGroup}>
                                <label>{t('addJob.sidebar.hourlyWage')}</label>
                                <InputField
                                    type="number"
                                    name="hourly_wage"
                                    className={styles.sidebarInput}
                                    value={formData.hourly_wage}
                                    onChange={handleInputChange}
                                    placeholder="2000"
                                />
                            </div>

                            <div className={styles.sidebarInputGroup}>
                                <label>{t('addJob.sidebar.jobType')}</label>
                                <select name="job_type" className={styles.sidebarSelect} onChange={handleInputChange}>
                                    <option value="Full-time">{t('addJob.sidebar.types.fullTime')}</option>
                                    <option value="Part-time">{t('addJob.sidebar.types.partTime')}</option>
                                    <option value="Freelance">{t('addJob.sidebar.types.freelance')}</option>
                                </select>
                            </div>

                            <div className={styles.statusBox}>
                                <div className={styles.checkboxLabel}>
                                    <Checkbox
                                        label={t('addJob.sidebar.active.label')}
                                        checked={formData.is_active}
                                        onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                    />
                                    <div>
                                        <span>{t('addJob.sidebar.active.hint')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.sidebarActions}>
                                <Button type="submit" color="orion-blue" disabled={isLoading} className={styles.submitBtn}>
                                    {isLoading ? t('addJob.sidebar.saving') : t('addJob.sidebar.submit')}
                                </Button>
                                <button type="button" className={styles.cancelLink} onClick={() => navigate(-1)}>
                                    {t('addJob.sidebar.cancel')}
                                </button>
                            </div>
                        </div>

                    </aside>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default AddJob;