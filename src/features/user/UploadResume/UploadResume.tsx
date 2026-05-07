import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { Upload, FileText, X, Info, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadResume, getUserResume, deleteResume } from "../../../Api/userApi";
import styles from "./UploadResume.module.css";

//components
import Button from "../../../components/ui/Button/Button.tsx";
import ConfirmModal from "../../../components/ui/ConfirmModal/ConfirmModal.tsx";

const UploadResume = () => {
    const { t } = useTranslation('user');
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        const fetchExistingResume = async () => {
            try {
                const data = await getUserResume();
                if (data.success && data.url) {
                    setExistingResumeUrl(data.url);
                }
            } catch (err) {
                console.error("Failed to fetch existing resume:", err);
            }
        };
        fetchExistingResume();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (selectedFile?: File) => {
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            toast.error(t('uploadResume.alerts.onlyPdf'));
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            toast.error(t('uploadResume.alerts.sizeLimit'));
            return;
        }

        setFile(selectedFile);
    };

    // Drag and Drop Handlers
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => setIsDragging(false);

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        validateAndSetFile(droppedFile);
    };

    const handleDeleteResume = async () => {
        try {
            const data = await deleteResume();
            if (data.success) {
                setExistingResumeUrl(null);
                toast.success(t('uploadResume.alerts.deleteSuccess'));
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : t('uploadResume.alerts.deleteError'));
        }
    };

    const handleSubmit = async () => {
        if (!file) return;
        setSending(true);
        try {
            await uploadResume(file);
            toast.success(t('uploadResume.alerts.success'));
            navigate("/usereditprofile");
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t('uploadResume.alerts.unknownError'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <main className={styles.container}>
                <div className={styles.uploadCard}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>{t('uploadResume.title')}</h1>
                        <p className={styles.subtitle}>{t('uploadResume.subtitle')}</p>
                    </div>

                    {!file && existingResumeUrl ? (
                        <div className={styles.premiumCard}>
                            <div className={styles.cardGlow}></div>
                            <div className={styles.cardContent}>
                                <div className={styles.statusIndicator}>
                                    <div className={styles.pulseDot}></div>
                                    <span>{t('uploadResume.status.active')}</span>
                                </div>
                                
                                <div className={styles.mainInfo}>
                                    <FileText size={48} className={styles.resIcon} />
                                    <div className={styles.textGroup}>
                                        <h2 className={styles.resTitle}>{t('uploadResume.existingResume')}</h2>
                                        <p className={styles.resSubtitle}>{t('uploadResume.info.storedShort')}</p>
                                    </div>
                                </div>

                                <div className={styles.btnGrid}>
                                    <Button
                                        variant="primary"
                                        color="orion-blue"
                                        onClick={() => window.open(existingResumeUrl, "_blank", "noopener,noreferrer")}
                                        className={styles.viewResBtn}
                                    >
                                        <FileText size={18} style={{marginRight: '8px'}} /> {t('uploadResume.buttons.viewCurrent')}
                                    </Button>
                                    
                                    <div className={styles.minorActions}>
                                        <button
                                            onClick={() => setIsDeleteModalOpen(true)}
                                            className={styles.iconActionDelete}
                                            title={t('uploadResume.buttons.delete')}
                                        >
                                            <Trash2 size={18} style={{marginRight: '8px'}} /> {t('uploadResume.buttons.delete')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div
                                className={`${styles.dropZone} ${isDragging ? styles.dragging : ""} ${file ? styles.hasFile : ""}`}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onDrop={onDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className={styles.hiddenInput}
                                />

                                {!file ? (
                                    <div className={styles.dropZoneContent}>
                                        <div className={styles.iconCircle}>
                                            <Upload size={32} />
                                        </div>
                                        <p className={styles.dropText}>
                                            <Trans i18nKey="uploadResume.dropText">
                                                <strong>Kattints a feltöltéshez</strong> vagy húzd ide a fájlt
                                            </Trans>
                                        </p>
                                        <span className={styles.fileHint}>{t('uploadResume.fileHint')}</span>
                                    </div>
                                ) : (
                                    <div className={styles.filePreview}>
                                        <FileText size={48} className={styles.fileIcon} />
                                        <div className={styles.fileInfo}>
                                            <span className={styles.fileName}>{file.name}</span>
                                            <span className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                        </div>
                                        <button
                                            className={styles.removeBtn}
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.infoBox}>
                                <Info size={18} />
                                <ul>
                                    <li>{t('uploadResume.info.stored')}</li>
                                    <li>{t('uploadResume.info.update')}</li>
                                </ul>
                            </div>

                            <div className={styles.actions}>
                                <Button
                                    type="button"
                                    color="orion-blue"
                                    variant="primary"
                                    onClick={handleSubmit}
                                    disabled={sending || !file}
                                    className={styles.submitBtn}
                                >
                                    {sending ? t('uploadResume.buttons.submitting') : t('uploadResume.buttons.submit')}
                                </Button>

                                <Button
                                    variant="link"
                                    underline
                                    onClick={() => navigate(-1)}
                                >
                                    {t('uploadResume.buttons.cancel')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteResume}
                title={t('uploadResume.alerts.confirmDelete')}
                message={t('uploadResume.info.deleteWarning', { defaultValue: 'This action cannot be undone. Your resume will be removed from your profile.' })}
                confirmText={t('uploadResume.buttons.delete')}
                cancelText={t('uploadResume.buttons.cancel')}
                type="danger"
                icon={<Trash2 size={24} />}
            />
        </div>
    );
};

export default UploadResume;