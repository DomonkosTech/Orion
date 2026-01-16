import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Building2, Phone, FileText,
    Save, Edit3, XCircle, ArrowLeft
} from "lucide-react";
import { getCompanyProfile, updateCompanyProfile, type CompanyProfile } from "../../../api/companyApi.ts";
import { toast, Toaster } from "react-hot-toast";
import { companyUpdateProfileSchema } from "../../../validation/Validation.ts";

import styles from "./CompanyEditProfile.module.css";
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";
import InputField from "../../../components/InputField/InputField.tsx";

const CompanyEditProfile: React.FC = () => {
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [originalCompany, setOriginalCompany] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await getCompanyProfile();
                if (data.success) {
                    setCompany(data.company);
                    setOriginalCompany(data.company);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

    const handleSave = async () => {
        if (!company) return;

        const validation = companyUpdateProfileSchema.safeParse(company);
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        setIsSaving(true);
        try {
            const data = await updateCompanyProfile(company);
            if (data.success) {
                setCompany(data.company);
                setOriginalCompany(data.company);
                setEditMode(false);
                toast.success("Sikeres mentés!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Hiba történt a mentés során!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setCompany(originalCompany);
        setEditMode(false);
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <Toaster />

            <main className={styles.container}>
                <h2>majd holnap befejezem, ez most nagyon gatyi</h2>
                {loading ? (
                    <div className={styles.loading}>Adatok betöltése...</div>
                ) : !company ? (
                    <div className={styles.loading}>Nem található cég adat.</div>
                ) : (
                    <>
                        <div className={styles.header}>
                            <div className={styles.titleArea}>
                                <h1>Cégkezelés</h1>
                                <p>Módosítsa vállalata adatait a munkaerő-toborzáshoz.</p>
                            </div>

                            <div className={styles.controls}>
                                {!editMode ? (
                                    <>
                                        <Button onClick={() => navigate("/company")} variant="secondary">
                                            <ArrowLeft size={18} /> Vissza
                                        </Button>
                                        <Button onClick={() => setEditMode(true)} color="orion-blue">
                                            <Edit3 size={18} /> Szerkesztés
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={handleCancel} variant="secondary">
                                            <XCircle size={18} /> Mégse
                                        </Button>
                                        <Button onClick={handleSave} color="orion-blue" isLoading={isSaving}>
                                            <Save size={18} /> Mentés
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            {/* Alapadatok */}
                            <section className={`${styles.card} ${styles.mainInfo}`}>
                                <h2 className={styles.sectionTitle}><Building2 size={20}/> Általános információk</h2>
                                <div className={styles.inputGrid}>
                                    <div className={styles.fieldFull}>
                                        <label>Cég neve</label>
                                        <InputField
                                            value={company.name}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, name: e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Adószám</label>
                                        <InputField
                                            value={company.tax_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, tax_number: e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <label>Tevékenységi kör</label>
                                        <InputField
                                            value={company.activity_scope}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, activity_scope: e.target.value})}
                                        />
                                    </div>
                                    <div className={styles.fieldFull}>
                                        <label>Weboldal (URL)</label>
                                        <InputField
                                            type="url"
                                            value={company.website}
                                            readOnly={!editMode}
                                            onChange={(e) => setCompany({...company, website: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Kapcsolattartás */}
                            <section className={`${styles.card} ${styles.sideInfo}`}>
                                <h2 className={styles.sectionTitle}><Phone size={20}/> Elérhetőség</h2>
                                <div className={styles.field}>
                                    <label>Kapcsolattartó neve</label>
                                    <InputField
                                        value={company.contact_person_name}
                                        readOnly={!editMode}
                                        onChange={(e) => setCompany({...company, contact_person_name: e.target.value})}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Telefonszám</label>
                                    <InputField
                                        value={company.phone_number}
                                        readOnly={!editMode}
                                        onChange={(e) => setCompany({...company, phone_number: e.target.value})}
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Cím</label>
                                    <InputField
                                        value={company.address}
                                        readOnly={!editMode}
                                        onChange={(e) => setCompany({...company, address: e.target.value})}
                                    />
                                </div>
                            </section>

                            {/* Bemutatkozás */}
                            <section className={`${styles.card} ${styles.fullWidth}`}>
                                <h2 className={styles.sectionTitle}><FileText size={20}/> Céges bemutatkozás</h2>
                                <div className={styles.fieldFull}>
                                    <TextArea
                                        label={""}
                                        rows={6}
                                        value={company.short_description}
                                        readOnly={!editMode}
                                        onChange={(e) => setCompany({...company, short_description: e.target.value})}
                                        placeholder="Írjon pár szót a cég küldetéséről és céljairól..."
                                    />
                                </div>
                            </section>
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CompanyEditProfile;