import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Edit3, Save, XCircle,
    ArrowLeft
} from "lucide-react";
import {
    getUserProfile,
    updateUserProfile,
    deleteResume,
    type UserProfileData,
    type Documents,
} from "../../api/userApi.ts";
import {
    getCompanyProfile,
    updateCompanyProfile,
    type CompanyProfile
} from "../../api/companyApi.ts";
import styles from "./EditProfile.module.css";
import { toast, Toaster } from "react-hot-toast";
import { userUpdateProfileSchema, companyUpdateProfileSchema } from "../../validation/Validation.ts";

// Components
import Button from "../Button/Button.tsx";
import BannerKicker from "../BannerKicker/BannerKicker.tsx";

export interface EditProfileRenderProps {
    user: UserProfileData | null;
    setUser: React.Dispatch<React.SetStateAction<UserProfileData | null>>;
    documents: Documents | null;
    setDocuments: React.Dispatch<React.SetStateAction<Documents | null>>;
    company: CompanyProfile | null;
    setCompany: React.Dispatch<React.SetStateAction<CompanyProfile | null>>;
    editMode: boolean;
    resume: boolean;
    handleDeleteResume: () => void;
    navigate: (path: string) => void;
}

interface EditProfileProps {
    type: "user" | "company";
    children: (props: EditProfileRenderProps) => React.ReactNode;
}

const EditProfile: React.FC<EditProfileProps> = ({ type, children }) => {
    // User state
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [documents, setDocuments] = useState<Documents | null>(null);
    const [originalUser, setOriginalUser] = useState<UserProfileData | null>(null);
    const [originalDocuments, setOriginalDocuments] = useState<Documents | null>(null);
    const [resume, setResume] = useState<boolean>(false);

    // Company state
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [originalCompany, setOriginalCompany] = useState<CompanyProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (type === "user") {
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
                } else {
                    const data = await getCompanyProfile();
                    if (data.success) {
                        setCompany(data.company);
                        setOriginalCompany(data.company);
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                toast.error("Adatok betöltése sikertelen.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (type === "user") {
                if (!user) return;
                const validationData = { ...user, documents };
                const validation = userUpdateProfileSchema.safeParse(validationData);

                if (!validation.success) {
                    toast.error(validation.error.errors[0].message);
                    return;
                }

                const data = await updateUserProfile({ user, documents });
                if (data.success) {
                    toast.success("Profil sikeresen frissítve!");
                    setOriginalUser(user);
                    setOriginalDocuments(documents);
                    setEditMode(false);
                }
            } else {
                if (!company) return;
                const validation = companyUpdateProfileSchema.safeParse(company);
                if (!validation.success) {
                    toast.error(validation.error.errors[0].message);
                    return;
                }

                const data = await updateCompanyProfile(company);
                if (data.success) {
                    setCompany(data.company);
                    setOriginalCompany(data.company);
                    setEditMode(false);
                    toast.success("Sikeres mentés!");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Hiba történt a mentés során!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (type === "user") {
            setUser(originalUser);
            setDocuments(originalDocuments);
        } else {
            setCompany(originalCompany);
        }
        setEditMode(false);
    };

    const handleDeleteResume = () => {
        toast((t) => (
            <div className={styles.toastConfirm}>
                <p>Biztosan törölni szeretné az önéletrajzát?</p>
                <div className={styles.toastActions}>
                    <Button
                        variant="secondary"
                        color="gray"
                        onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        Mégse
                    </Button>
                    <Button
                        variant="primary"
                        color="danger"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const data = await deleteResume();
                                if (data.success) {
                                    setResume(false);
                                    toast.success("Önéletrajz törölve.");
                                }
                            } catch (err) {
                                console.error(err);
                                toast.error("Hiba történt a törlés során.");
                            }
                        }}
                        style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        Törlés
                    </Button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
        });
    };

    const renderProps: EditProfileRenderProps = {
        user,
        setUser,
        documents,
        setDocuments,
        company,
        setCompany,
        editMode,
        resume,
        handleDeleteResume,
        navigate,
    };

    return (
        <>
            <Toaster />
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>Adatok betöltése...</p>
                </div>
            ) : (!user && type === "user") || (!company && type === "company") ? (
                <div className={styles.loadingState}>
                    <p>Nem található adat.</p>
                    <Button onClick={() => navigate(type === "user" ? "/userhomepage" : "/company")} color="orion-blue">Vissza a főoldalra</Button>
                </div>
            ) : (
                <>
                    <div className={styles.profileHeader}>
                        <div className={styles.titleGroup}>
                            <BannerKicker>{type === "user" ? "Felhasználói Fiók" : "Cégkezelés"}</BannerKicker>
                            <h1>{type === "user" ? "Profilom" : "Cégadatok"}</h1>
                            <p>{type === "user" ? "Kezeld a személyes adataidat és dokumentumaidat egy helyen." : "Módosítsa vállalata adatait a munkaerő-toborzáshoz."}</p>
                        </div>

                        {!editMode ? (
                            <div className={styles.actionGroup}>
                                <Button
                                    onClick={() => navigate(type === "user" ? "/userhomepage" : "/company")}
                                    variant="secondary"
                                    color="black"
                                    className={styles.headerBtn}
                                >
                                    <ArrowLeft size={18} style={{marginRight: '8px'}} /> Vissza
                                </Button>
                                <Button
                                    onClick={() => navigate(type === "user" ? "/user/password/reset" : "/company/password/reset")}
                                    variant="secondary"
                                    color="orion-blue"
                                    className={styles.headerBtn}
                                >
                                    Jelszó módosítása
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
                        {children(renderProps)}
                    </form>
                </>
            )}
        </>
    );
};

export default EditProfile;