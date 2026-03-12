import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import styles from "./LoginPage.module.css";
import { useTranslation } from "react-i18next";

// Import Shared Components and Services
import InputField from "../InputField/InputField";
import Checkbox from "../Checkbox/Checkbox";
import Button from "../Button/Button.tsx";
import { Header } from "../Header/Header.tsx";
import Footer from "../Footer/Footer.tsx";
import { loginSchema } from "../../validation/Validation.ts";

interface LoginPageProps {
    title: string;
    onLogin: (data: any) => Promise<any>;
    onSuccessRedirect: string;
    onVerifyRedirect: string;
    registerPath: string;
    forgotPasswordPath: string;
    switchViewPath: string;
    switchViewLabel: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
    title,
    onLogin,
    onSuccessRedirect,
    onVerifyRedirect,
    registerPath,
    forgotPasswordPath,
    switchViewPath,
    switchViewLabel
}) => {
    const { t } = useTranslation('components');
    // State for form inputs, loading status, and navigation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handles the login process
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Zod validáció futtatása
        const validation = loginSchema.safeParse({ email, password, rememberMe });

        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        setIsLoading(true);

        try {
            // Attempt to log in using the provided service
            const data = await onLogin({ email, password, rememberMe });

            if (data && data.success === false) {
                 toast.error(data.error || t('loginPage.genericError'));
                 return;
            }

            toast.success(t('loginPage.loginSuccess'));
            // Dispatch a global event to notify other parts of the app (e.g., navbar)
            try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
            // Navigate to the home page on successful login
            navigate(onSuccessRedirect);
            
        } catch (err: unknown) {
            // Handle and display errors from the service or network
            console.error(err);

            const errorObj = err as { status?: number; message?: string };
                
            if (errorObj.status === 403 || errorObj.message === "Account not activated") {
                toast.error(t('loginPage.accountNotActivated'));
                navigate(onVerifyRedirect);
                return;
            }

            const message = err instanceof Error ? err.message : t('loginPage.networkError');
            toast.error(message);
        } finally {
            // Stop the loading indicator
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className={styles.container}>
                <form onSubmit={handleLogin} className={styles.form} noValidate>
                    <h1>{title}</h1>

                    {/* Input Fields Container */}
                    <div className={styles.fieldsContainer}>
                        <InputField
                            id="email"
                            label={t('loginPage.emailLabel')}
                            type="email"
                            placeholder={t('loginPage.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <InputField
                            id="password"
                            label={t('loginPage.passwordLabel')}
                            isPassword
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {/* Options Row: Remember Me & Forgot Password */}
                    <div className={styles.optionsRow}>
                        <Checkbox
                            label={t('loginPage.rememberMe')}
                            checked={rememberMe}
                            onChange={setRememberMe}
                        />
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate(forgotPasswordPath)}
                        >
                            {t('loginPage.forgotPassword')}
                        </Button>
                    </div>

                    {/* Main Actions */}
                    <div className={styles.actions}>
                        <Button type="submit" isLoading={isLoading} variant="primary">
                            {t('loginPage.loginButton')}
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(registerPath)}
                        >
                            {t('loginPage.registerButton')}
                        </Button>
                    </div>

                    {/* Footer / Switch View */}
                    <div className={styles.footer}>
                        <p>
                            {t('loginPage.noAccount')}{" "}
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate(registerPath)}
                                style={{ display: 'inline', padding: 0 }}
                            >
                                {t('loginPage.registerHere')}
                            </Button>
                        </p>

                        <div className={styles.divider} />

                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate(switchViewPath)}
                        >
                            {switchViewLabel}
                        </Button>
                    </div>
                </form>
            </div>
            <Footer/>
        </>
    );
};

export default LoginPage;