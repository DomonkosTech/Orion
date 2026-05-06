import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import styles from "./VerifyPage.module.css";

interface VerifyPageProps {
    onVerify: (token: string) => Promise<void>;
    loginPath: string;
    translationNamespace: string;
}

const VerifyPage: React.FC<VerifyPageProps> = ({ 
    onVerify, 
    loginPath, 
    translationNamespace 
}) => {
    const { t } = useTranslation(translationNamespace);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isVerifying = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (token && !isVerifying.current) {
            isVerifying.current = true;

            onVerify(token)
                .then(() => {
                    toast.success(t('verify.success'));
                    setTimeout(() => navigate(loginPath), 2000);
                })
                .catch((error: Error) => {
                    toast.error(t('verify.error') + (error.message || ""));
                });
        }
    }, [searchParams, navigate, onVerify, loginPath, t]);

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <header className={styles.header}>
                        <h1>{t('verify.title')}</h1>
                        <div className={styles.section}>
                            <p>{t('verify.verifying')}</p>
                            <div className={styles.stepper}>
                                <div className={`${styles.step} ${styles.active}`} />
                            </div>
                        </div>
                    </header>
                </div>
            </div>
        </div>
    );
};

export default VerifyPage;
