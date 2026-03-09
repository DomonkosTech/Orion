import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";
import { Upload, FileText, X, Info } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { uploadResume } from "../../../Api/userApi";
import styles from "./UploadResume.module.css";

//components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

const UploadResume = () => {
    const { t } = useTranslation('user');
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

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
            <Toaster />
            <Header />

            <main className={styles.container}>
                <div className={styles.uploadCard}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>{t('uploadResume.title')}</h1>
                        <p className={styles.subtitle}>{t('uploadResume.subtitle')}</p>
                    </div>

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
                </div>
            </main>
            <Footer></Footer>
        </div>
    );
};

export default UploadResume;