import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./LoginPage.module.css";

// Import Shared Components and Services
import InputField from "../InputField/InputField";
import Checkbox from "../Checkbox/Checkbox";
import Button from "../Button/Button.tsx";
import { Header } from "../Header/Header.tsx";
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

            // Check if the response indicates success (handling different API return structures if needed)
            // Assuming onLogin returns the data object directly or throws
            // If the API returns { success: true, ... } check that, otherwise assume success if no error thrown
            if (data && data.success === false) {
                 toast.error(data.error || "Hiba történt");
                 return;
            }

            toast.success("Sikeres bejelentkezés!");
            // Dispatch a global event to notify other parts of the app (e.g., navbar)
            try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
            // Navigate to the home page on successful login
            navigate(onSuccessRedirect);
            
        } catch (err: unknown) {
            // Handle and display errors from the service or network
            console.error(err);

            const errorObj = err as { status?: number; message?: string };
                
            if (errorObj.status === 403 || errorObj.message === "Account not activated") {
                toast.error("A fiók nincs aktiválva. Kérjük hitelesítse email címét!");
                navigate(onVerifyRedirect);
                return;
            }

            const message = err instanceof Error ? err.message : "Hálózati hiba történt";
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
                <Toaster />
                <form onSubmit={handleLogin} className={styles.form} noValidate>
                    <h1>{title}</h1>

                    {/* Input Fields Container */}
                    <div className={styles.fieldsContainer}>
                        <InputField
                            id="email"
                            label="Email cím"
                            type="email"
                            placeholder="email@pelda.hu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <InputField
                            id="password"
                            label="Jelszó"
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
                            label="Emlékezz rám"
                            checked={rememberMe}
                            onChange={setRememberMe}
                        />
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate(forgotPasswordPath)}
                        >
                            Elfelejtette jelszavát?
                        </Button>
                    </div>

                    {/* Main Actions */}
                    <div className={styles.actions}>
                        <Button type="submit" isLoading={isLoading} variant="primary">
                            Bejelentkezés
                        </Button>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate(registerPath)}
                        >
                            Regisztráció
                        </Button>
                    </div>

                    {/* Footer / Switch View */}
                    <div className={styles.footer}>
                        <p>
                            Nincs még fiókja?{" "}
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate(registerPath)}
                                style={{ display: 'inline', padding: 0 }}
                            >
                                Regisztráljon itt
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
        </>
    );
};

export default LoginPage;