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
} from "../../Api/userApi.ts";
import {
    getCompanyProfile,
    updateCompanyProfile,
    type CompanyProfile
} from "../../Api/companyApi.ts";
import styles from "./EditProfile.module.css";
import { toast } from "react-hot-toast";
import { userUpdateProfileSchema, companyUpdateProfileSchema } from "../../validation/Validation.ts";
import { useTranslation } from "react-i18next";

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
    const { t } = useTranslation('components');
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
                toast.error(t('editProfile.loadingError'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, t]);

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
                    toast.success(t('editProfile.saveSuccess'));
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
                    toast.success(t('editProfile.saveSuccess'));
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(t('editProfile.saveError'));
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
        toast((toastInstance) => (
            <div className={styles.toastConfirm}>
                <p>{t('editProfile.deleteResumeConfirmation')}</p>
                <div className={styles.toastActions}>
                    <Button
                        variant="secondary"
                        color="gray"
                        onClick={() => toast.dismiss(toastInstance.id)}
                        style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        {t('editProfile.cancel')}
                    </Button>
                    <Button
                        variant="primary"
                        color="danger"
                        onClick={async () => {
                            toast.dismiss(toastInstance.id);
                            try {
                                const data = await deleteResume();
                                if (data.success) {
                                    setResume(false);
                                    toast.success(t('editProfile.resumeDeleted'));
                                }
                            } catch (err) {
                                console.error(err);
                                toast.error(t('editProfile.deleteError'));
                            }
                        }}
                        style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                    >
                        {t('editProfile.delete')}
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
            {loading ? (
                <div className={styles.loadingState}>
                    <div className={styles.spinner}></div>
                    <p>{t('editProfile.loadingData')}</p>
                </div>
            ) : (!user && type === "user") || (!company && type === "company") ? (
                <div className={styles.loadingState}>
                    <p>{t('editProfile.noData')}</p>
                    <Button onClick={() => navigate(-1)} color="orion-blue">{t('editProfile.backToMain')}</Button>
                </div>
            ) : (
                <>
                    <div className={styles.profileHeader}>
                        <div className={styles.titleGroup}>
                            <BannerKicker>{type === "user" ? t('editProfile.userAccount') : t('editProfile.companyManagement')}</BannerKicker>
                            <h1>{type === "user" ? t('editProfile.myProfile') : t('editProfile.companyData')}</h1>
                            <p>{type === "user" ? t('editProfile.userDescription') : t('editProfile.companyDescription')}</p>
                        </div>

                        {!editMode ? (
                            <div className={styles.actionGroup}>
                                <Button
                                    onClick={() => navigate(-1)}
                                    variant="secondary"
                                    color="black"
                                    className={styles.headerBtn}
                                >
                                    <ArrowLeft size={18} style={{marginRight: '8px'}} /> {t('editProfile.back')}
                                </Button>
                                <Button
                                    onClick={() => navigate(type === "user" ? "/user/password/reset" : "/company/password/reset")}
                                    variant="secondary"
                                    color="orion-blue"
                                    className={styles.headerBtn}
                                >
                                    {t('editProfile.changePassword')}
                                </Button>
                                <Button
                                    onClick={() => setEditMode(true)}
                                    color="orion-blue"
                                    variant="primary"
                                    className={styles.headerBtn}
                                >
                                    <Edit3 size={18} style={{marginRight: '8px'}} /> {t('editProfile.edit')}
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
                                    <XCircle size={18} style={{marginRight: '8px'}} /> {t('editProfile.cancel')}
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    color="orion-blue"
                                    isLoading={isSaving}
                                    className={styles.headerBtn}
                                >
                                    <Save size={18} style={{marginRight: '8px'}} /> {t('editProfile.save')}
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