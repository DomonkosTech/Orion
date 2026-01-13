import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    User, Mail, Phone, MapPin, Calendar, CreditCard,
    BookOpen, FileText, Trash2, Plus, Edit3, Save, XCircle,
    ArrowLeft
} from "lucide-react";
import {
    getUserProfile,
    updateUserProfile,
    deleteResume,
    type UserProfileData,
    type Documents,
} from "../../../Api/userApi.ts";
import styles from "./EditUserProfile.module.css";
import { toast, Toaster } from "react-hot-toast";
import { userUpdateProfileSchema } from "../../../validation/validation";

// Components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import InputField from "../../../components/InputField/InputField.tsx";
import TextArea from "../../../components/TextArea/TextArea.tsx";

const EditUserProfile: React.FC = () => {
    // Current state for inputs
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [documents, setDocuments] = useState<Documents | null>(null);

    // Backup state for "Cancel" functionality
    const [originalUser, setOriginalUser] = useState<UserProfileData | null>(null);
    const [originalDocuments, setOriginalDocuments] = useState<Documents | null>(null);

    const [resume, setResume] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserProfile();
                if (data.success) {
                    const userData = data.user;
                    const docData = data.documents?.[0] || null;

                    setUser(userData);
                    setOriginalUser(userData);
                    setDocuments(docData);
                    setOriginalDocuments(docData);
                    setResume(data.hasResume);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        if (!user) return;

        // Zod validáció futtatása
        const validationData = { ...user, documents };
        const validation = userUpdateProfileSchema.safeParse(validationData);

        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        setIsSaving(true);
        try {
            const data = await updateUserProfile({ user, documents });
            if (data.success) {
                toast.success("Profil sikeresen frissítve!");
                setOriginalUser(user);
                setOriginalDocuments(documents);
                setEditMode(false);
            }
        } catch {
            toast.error("Hiba történt a mentés során!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setUser(originalUser);
        setDocuments(originalDocuments);
        setEditMode(false);
    };

    const handleDeleteResume = async () => {
        if (!window.confirm("Biztosan törölni szeretné az önéletrajzát?")) return;
        try {
            const data = await deleteResume();
            if (data.success) {
                setResume(false);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />
            <Toaster />

            <main className={styles.container}>
                {loading ? (
                    <div className={styles.loadingState}>
                        <div className={styles.spinner}></div>
                        <p>Adatok betöltése...</p>
                    </div>
                ) : !user ? (
                    <div className={styles.loadingState}>
                        <p>Nem található felhasználói adat.</p>
                        <Button onClick={() => navigate("/userhomepage")} color="orion-blue">Vissza a főoldalra</Button>
                    </div>
                ) : (
                    <>
                        <div className={styles.profileHeader}>
                            <div className={styles.titleGroup}>
                                <BannerKicker>Felhasználói Fiók</BannerKicker>
                                <h1>Profilom</h1>
                                <p>Kezeld a személyes adataidat és dokumentumaidat egy helyen.</p>
                            </div>

                            {!editMode ? (
                                <div className={styles.actionGroup}>
                                    <Button
                                        onClick={() => navigate("/userhomepage")}
                                        variant="secondary"
                                        color="black"
                                        className={styles.headerBtn}
                                    >
                                        <ArrowLeft size={18} style={{marginRight: '8px'}} /> Vissza
                                    </Button>
                                    <Button
                                        onClick={() => setEditMode(true)}
                                        color="orion-blue"
                                        variant="primary"
                                        className={styles.headerBtn}
                                    >
                                        <Edit3 size={18} style={{marginRight: '8px'}} /> Szerkesztés
                                    </Button>
                                </div>
                            ) : (
                                <div className={styles.actionGroup}>
                                    <Button
                                        onClick={handleCancel}
                                        variant="secondary"
                                        color="black"
                                        className={styles.headerBtn}
                                    >
                                        <XCircle size={18} style={{marginRight: '8px'}} /> Mégse
                                    </Button>
                                    <Button
                                        onClick={handleSave}
                                        color="orion-blue"
                                        isLoading={isSaving}
                                        className={styles.headerBtn}
                                    >
                                        <Save size={18} style={{marginRight: '8px'}} /> Mentés
                                    </Button>
                                </div>
                            )}
                        </div>

                        <form className={styles.formGrid}>
                            <section className={styles.formCard}>
                                <h2 className={styles.cardTitle}><User size={20} /> Személyes adatok</h2>
                                <div className={styles.inputGroup}>
                                    <InputField
                                        label="Vezetéknév"
                                        value={user.lname}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, lname: e.target.value })}
                                        containerClassName={styles.field}
                                    />
                                    <InputField
                                        label="Keresztnév"
                                        value={user.fname}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, fname: e.target.value })}
                                        containerClassName={styles.field}
                                    />
                                    <InputField
                                        label={<><Calendar size={14}/> Születési dátum</>}
                                        type="date"
                                        value={user.birth_date}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, birth_date: e.target.value })}
                                        containerClassName={styles.field}
                                    />
                                    <InputField
                                        label="Születési hely"
                                        value={user.birth_place}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, birth_place: e.target.value })}
                                        containerClassName={styles.field}
                                    />
                                </div>
                            </section>

                            <section className={styles.formCard}>
                                <h2 className={styles.cardTitle}><Mail size={20} /> Elérhetőség</h2>
                                <div className={styles.inputGroup}>
                                    <InputField
                                        label="Email cím"
                                        type="email"
                                        value={user.email}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                                        containerClassName={styles.fieldFull}
                                    />
                                    <InputField
                                        label={<><Phone size={14}/> Telefonszám</>}
                                        value={user.phone_number}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                                        containerClassName={styles.fieldFull}
                                    />
                                    <InputField
                                        label={<><MapPin size={14}/> Lakcím</>}
                                        value={user.address}
                                        readOnly={!editMode}
                                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                                        containerClassName={styles.fieldFull}
                                    />
                                </div>
                            </section>

                            <section className={`${styles.formCard} ${styles.fullWidth}`}>
                                <h2 className={styles.cardTitle}><BookOpen size={20} /> Szakmai profil</h2>
                                <div className={styles.inputGroup}>
                                    <div className={styles.fieldFull}>
                                        <TextArea
                                            label="Rövid bemutatkozás"
                                            value={user.short_bio}
                                            readOnly={!editMode}
                                            maxLength={500}
                                            onChange={(e) => setUser({ ...user, short_bio: e.target.value })}
                                        />
                                    </div>
                                    <div className={styles.fieldFull}>
                                        <TextArea
                                            label="Végzettségek"
                                            value={user.qualifications}
                                            readOnly={!editMode}
                                            maxLength={1000}
                                            onChange={(e) => setUser({ ...user, qualifications: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className={`${styles.formCard} ${styles.fullWidth}`}>
                                <h2 className={styles.cardTitle}><CreditCard size={20} /> Okmányok & Önéletrajz</h2>
                                <div className={styles.docGrid}>
                                    <div className={styles.docFields}>
                                        <InputField
                                            label="Adószám"
                                            value={user.tax_number}
                                            readOnly={!editMode}
                                            onChange={(e) => setUser({ ...user, tax_number: e.target.value })}
                                            containerClassName={styles.field}
                                        />
                                        {documents && (
                                            <InputField
                                                label="Személyi igazolvány"
                                                value={documents.personal_id}
                                                readOnly={!editMode}
                                                onChange={(e) => setDocuments({ ...documents, personal_id: e.target.value })}
                                                containerClassName={styles.field}
                                            />
                                        )}
                                    </div>

                                    <div className={styles.resumeStatusBox}>
                                        <div className={styles.resumeInfo}>
                                            <FileText size={32} className={resume ? styles.iconActive : styles.iconMuted} />
                                            <div>
                                                <h3>Önéletrajz</h3>
                                                <p>{resume ? "Feltöltve és aktív" : "Még nincs feltöltve"}</p>
                                            </div>
                                        </div>
                                        {resume ? (
                                            <Button
                                                type="button"
                                                onClick={handleDeleteResume}
                                                color="fire-red"
                                                variant="secondary"
                                            >
                                                <Trash2 size={16} style={{marginRight: '8px'}} /> Törlés
                                            </Button>
                                        ) : (
                                            <Button
                                                type="button"
                                                onClick={() => navigate("/uploadresume")}
                                                color="orion-blue"
                                            >
                                                <Plus size={16} style={{marginRight: '8px'}} /> Feltöltés
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </form>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default EditUserProfile;