import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import styles from "../VerifyPage/VerifyPage.module.css";
import InputField from "../InputField/InputField";
import Button from "../Button/Button.tsx";
import {Header} from "../Header/Header.tsx";
import Footer from "../Footer/Footer.tsx";

interface SendVerifyPageProps {
    onSend: (email: string) => Promise<any>;
    translationNamespace: string;
}

const SendVerifyPage: React.FC<SendVerifyPageProps> = ({ 
    onSend, 
    translationNamespace 
}) => {
    const { t } = useTranslation(translationNamespace);
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
            await onSend(email);
            toast.success(t('sendVerify.success'));
            setEmail("");
        } catch (error: any) {
            console.error(error);
            toast.error(t('sendVerify.errorSend'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.page}>
                <Toaster />
                <div className={styles.container}>
                    <div className={styles.card}>
                        <header className={styles.header}>
                            <h1>{t('sendVerify.title')}</h1>
                            <p>{t('sendVerify.description')}</p>
                        </header>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.section}>
                                <InputField
                                    label={t('sendVerify.emailLabel')}
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('sendVerify.emailPlaceholder')}
                                    required
                                />
                            </div>

                            <div className={styles.footer}>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    color="orion-blue"
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
            <Footer />
        </>
    );
};

export default SendVerifyPage;
