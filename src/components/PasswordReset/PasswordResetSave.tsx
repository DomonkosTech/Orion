import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, Toaster } from "react-hot-toast";
import styles from "./PasswordResetSave.module.css";
import InputField from "../InputField/InputField";
import Button from "../Button/Button";
import { Header } from "../Header/Header";

interface PasswordResetSaveProps {
    onSavePassword: (token: string, password: string) => Promise<void>;
    redirectPath: string;
}

const PasswordResetSave: React.FC<PasswordResetSaveProps> = ({
    onSavePassword,
    redirectPath
}) => {
    const { t } = useTranslation('components');
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error(t('passwordResetSave.errorMatch'));
            return;
        }

        if (password.length < 6) {
            toast.error(t('passwordResetSave.errorLength'));
            return;
        }

        const token = searchParams.get("token");
        if (!token) {
            toast.error(t('passwordResetSave.errorToken'));
            return;
        }

        try {
            await onSavePassword(token, password);
            toast.success(t('passwordResetSave.success'));
            navigate(redirectPath);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('passwordResetSave.errorSave');
            toast.error(errorMessage);
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <Toaster />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <h2 className={styles.title}>{t('passwordResetSave.title')}</h2>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="password">{t('passwordResetSave.passwordLabel')}</label>
                                <InputField
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t('passwordResetSave.passwordPlaceholder')}
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">{t('passwordResetSave.confirmLabel')}</label>
                                <InputField
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('passwordResetSave.confirmPlaceholder')}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                color={"orion-blue"}
                                style={{ width: '100%' }}
                            >
                                {t('passwordResetSave.button')}
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PasswordResetSave;