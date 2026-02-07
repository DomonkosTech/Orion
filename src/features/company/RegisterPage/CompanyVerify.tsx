import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { verifyCompanyEmail } from "../../../Api/emailApi.ts";
import { toast, Toaster } from "react-hot-toast";
import styles from "../../user/RegisterPage/UserRegisterPage.module.css";

const CompanyVerify = () => {
    const { t } = useTranslation('company');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isVerifying = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (token && !isVerifying.current) {
            isVerifying.current = true;

            verifyCompanyEmail(token)
                .then(() => {
                    toast.success(t('verify.success'));
                    setTimeout(() => navigate("/CompanyLoginPage"), 2000);
                })
                .catch((error) => {
                    toast.error(t('verify.error') + error.message);
                });
        }
    }, [searchParams, navigate]);

    return (
        <div className={styles.page}>
            <Toaster />
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <header className={styles.header}>
                        <h1>{t('verify.title')}</h1>
                        <div className={styles.section} style={{ marginTop: '2rem' }}>
                            <p>{t('verify.verifying')}</p>
                            {/* You could add a Spinner component here */}
                            <div className={styles.stepper}>
                                <div className={`${styles.step} ${styles.active}`} style={{ width: '100px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        </div>
                    </header>
                </div>
            </div>
        </div>
    );
};

export default CompanyVerify;