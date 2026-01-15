import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdvertisement } from "../../../api/advertisementApi";
import { toast, Toaster } from "react-hot-toast";
import styles from "./AddJob.module.css";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";
import InputField from "../../../components/InputField/InputField.tsx";

const BENEFITS_OPTIONS = ["Home Office", "Cafeteria", "Bónusz", "Céges autó", "Rugalmas munkaidő", "Modern eszközök"];

const AddJob: React.FC = () => {
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
        benefits: [] as string[],
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
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const toggleBenefit = (benefit: string) => {
        setFormData(prev => ({
            ...prev,
            benefits: prev.benefits.includes(benefit)
                ? prev.benefits.filter(b => b !== benefit)
                : [...prev.benefits, benefit]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.position.trim() || !formData.location.trim() || !formData.hourly_wage.trim()) {
            toast.error("Kérlek, töltsd ki a kötelező mezőket!");
            return;
        }

        setIsLoading(true);
        try {
            await createAdvertisement({
                ...formData,
                hourly_wage: parseFloat(formData.hourly_wage),
            });
            toast.success("Sikeres a hirdetés létrehozása!");
            navigate("/company");
        } catch {
            toast.error("Hiba a hirdetés létrehozása során.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <Toaster position="top-center" />

            <main className={styles.container}>
                <header className={styles.header}>
                    <BannerKicker>Adminisztráció</BannerKicker>
                    <h1 className={styles.title}>Új hirdetés közzététele</h1>
                    <p className={styles.subtitle}>Készítsen profi álláshirdetést percek alatt.</p>
                </header>

                <form onSubmit={handleSubmit} className={styles.layout}>
                    {/* Main Content Area */}
                    <div className={styles.mainContent}>

                        {/* Section 1: Alapadatok */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><span>1</span> Alapadatok</h2>
                            <div className={styles.formGrid}>
                                <div className={styles.fullWidth}>
                                    <InputField
                                        label="Hirdetés címe *"
                                        name="title"
                                        placeholder="pl. Senior Logisztikai Menedzser"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <InputField
                                    label="Pozíció *"
                                    name="position"
                                    placeholder="pl. Raktáros"
                                    value={formData.position}
                                    onChange={handleInputChange}
                                    required
                                />
                                <InputField
                                    label="Munkavégzés helye *"
                                    name="location"
                                    placeholder="Budapest, XIII. kerület"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </section>

                        {/* Section 2: Részletek & Leírás */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><span>2</span> Feladatok & Elvárások</h2>
                            <div className={styles.stackedInputs}>
                                <TextArea
                                    label="Munka Leírása"
                                    name="job_description"
                                    placeholder="Mutassa be a céget és a lehetőséget..."
                                    rows={5}
                                    value={formData.job_description}
                                    onChange={handleInputChange}
                                />
                                <div className={styles.formGrid}>
                                    <TextArea
                                        label="Feladatok"
                                        name="tasks"
                                        placeholder="Napi teendők listája..."
                                        rows={4}
                                        value={formData.tasks}
                                        onChange={handleInputChange}
                                    />
                                    <TextArea
                                        label="Követelmények"
                                        name="requirements"
                                        placeholder="Tapasztalat, nyelvtudás..."
                                        rows={4}
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Extra Juttatások (Interactive Tags) */}
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}><span>3</span> Extra Juttatások</h2>
                            <p className={styles.hint}>Válassza ki, mit kínál a jelentkezőknek:</p>
                            <div className={styles.benefitsGrid}>
                                {BENEFITS_OPTIONS.map(benefit => (
                                    <button
                                        key={benefit}
                                        type="button"
                                        className={`${styles.benefitTag} ${formData.benefits.includes(benefit) ? styles.activeBenefit : ""}`}
                                        onClick={() => toggleBenefit(benefit)}
                                    >
                                        {benefit}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <aside className={styles.sidebar}>
                        <div className={`${styles.card} ${styles.stickyCard}`}>
                            <h3 className={styles.sidebarTitle}>Beállítások</h3>

                            <div className={styles.sidebarInputGroup}>
                                <label>Órabér (HUF)</label>
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
                                <label>Foglalkoztatás típusa</label>
                                <select name="job_type" className={styles.sidebarSelect} onChange={handleInputChange}>
                                    <option value="Full-time">Teljes munkaidő</option>
                                    <option value="Part-time">Részmunkaidő</option>
                                    <option value="Freelance">Projektmunka</option>
                                </select>
                            </div>

                            <div className={styles.statusBox}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                    />
                                    <div>
                                        <strong>Azonnali aktiválás</strong>
                                        <span>A hirdetés rögtön látható lesz</span>
                                    </div>
                                </label>
                            </div>

                            <div className={styles.sidebarActions}>
                                <Button type="submit" color="orion-blue" disabled={isLoading} className={styles.submitBtn}>
                                    {isLoading ? "Mentés..." : "Hirdetés közzététele"}
                                </Button>
                                <button type="button" className={styles.cancelLink} onClick={() => navigate("/company")}>
                                    Mégsem és visszalépés
                                </button>
                            </div>
                        </div>

                        <div className={styles.tipCard}>
                            <h4>💡 Tipp a sikerhez</h4>
                            <p>A részletesen kitöltött "Feladatok" szekció 40%-kal növeli a jelentkezési kedvet!</p>
                        </div>
                    </aside>
                </form>
            </main>
            <Footer />
        </div>
    );
};

export default AddJob;