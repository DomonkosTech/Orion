import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "react-hot-toast";
import { sendCompanyVerificationEmail } from "../../../Api/emailApi.ts";
import styles from "../../user/RegisterPage/UserRegisterPage.module.css";

//components
import InputField from "../../../components/InputField/InputField";
import Button from "../../../components/Button/Button.tsx";

const CompanySendVerify: React.FC = () => {
    const { t } = useTranslation('company');
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t('sendVerify.errorEmail'));
            return;
        }

        setIsLoading(true);
        try {
            await sendCompanyVerificationEmail(email);
            toast.success(t('sendVerify.success'));
            setEmail("");
        } catch (error) {
            console.error(error);
            toast.error(t('sendVerify.errorSend'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Toaster />
            <div className={styles.container}>
                <div className={styles.card}>
                    <header className={styles.header}>
                        <h1>{t('sendVerify.title')}</h1>
                        <p>{t('sendVerify.description')}</p>
                    </header>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <section className={styles.section}>
                            <InputField
                                label={t('sendVerify.emailLabel')}
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('sendVerify.emailPlaceholder')}
                            />
                        </section>

                        <div className={styles.footer}>
                            <Button
                                type="submit"
                                variant="primary"
                                color={"orion-blue"}
                                isLoading={isLoading}
                                style={{ width: '100%' }}
                            >
                                {t('sendVerify.button')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompanySendVerify;