import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, Info } from "lucide-react";
import { uploadResume } from "../../../Api/userApi";
import styles from "./UploadResume.module.css";

//components
import { Header } from "../../../components/Header/Header.tsx";
import Button from "../../../components/Button/Button.tsx";
import Footer from "../../../components/Footer/Footer.tsx";

const UploadResume = () => {
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
            alert("Csak PDF fájlt lehet feltölteni!");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert("A fájl mérete nem lehet nagyobb 5MB-nál!");
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
            alert("Önéletrajz sikeresen feltöltve!");
            navigate("/edituserprofile");
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Ismeretlen hiba");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.container}>
                <div className={styles.uploadCard}>
                    <div className={styles.headerSection}>
                        <h1 className={styles.title}>Önéletrajz feltöltése</h1>
                        <p className={styles.subtitle}>Töltsd fel szakmai önéletrajzod PDF formátumban a gyorsabb jelentkezéshez.</p>
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
                                    <strong>Kattints a feltöltéshez</strong> vagy húzd ide a fájlt
                                </p>
                                <span className={styles.fileHint}>Csak PDF (Max. 5MB)</span>
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
                            <li>A feltöltött fájlt profilod részeként tároljuk.</li>
                            <li>Bármikor frissítheted vagy törölheted.</li>
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
                            {sending ? "Feltöltés folyamatban..." : "Önéletrajz mentése"}
                        </Button>

                        <Button
                            variant="link"
                            underline
                            onClick={() => navigate("/EditUserProfile")}
                        >
                            Mégse
                        </Button>
                    </div>
                </div>
            </main>
            <Footer></Footer>
        </div>
    );
};

export default UploadResume;