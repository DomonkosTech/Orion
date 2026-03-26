import React, { useState } from "react";
import { toast } from "react-hot-toast";
import styles from "./PasswordResetRequest.module.css";
import { useTranslation } from "react-i18next";

// components
import InputField from "../../../components/ui/InputField/InputField";
import Button from "../../../components/ui/Button/Button";
import { Header } from "../../../components/layout/Header/Header";

interface PasswordResetRequestProps {
    onSendEmail: (email: string) => Promise<void>;
    title?: string;
    description?: string;
    successMessage?: string;
}

const PasswordResetRequest: React.FC<PasswordResetRequestProps> = ({
    onSendEmail,
    title,
    description,
    successMessage
}) => {
    const { t } = useTranslation('components');
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const finalTitle = title || t('passwordResetRequest.title');
    const finalDescription = description || t('passwordResetRequest.description');
    const finalSuccessMessage = successMessage || t('passwordResetRequest.successMessage');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error(t('passwordResetRequest.emailRequired'));
            return;
        }

        setIsLoading(true);
        try {
            await onSendEmail(email);
            toast.success(finalSuccessMessage);
            setEmail("");
        } catch (error) {
            console.error(error);
            toast.error(t('passwordResetRequest.sendError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <header className={styles.header}>
                            <h1>{finalTitle}</h1>
                            <p>{finalDescription}</p>
                        </header>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <section className={styles.section}>
                                <InputField
                                    label={t('passwordResetRequest.emailLabel')}
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('passwordResetRequest.emailPlaceholder')}
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
                                    {t('passwordResetRequest.sendLink')}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PasswordResetRequest;