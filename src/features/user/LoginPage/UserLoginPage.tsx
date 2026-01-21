import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserLoginPage.module.css";

// Import Shared Components and Services
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Button/Button.tsx";
import { loginUser } from "../../../api/userApi.ts";
import { loginSchema } from "../../../validation/Validation.ts";

const UserLoginPage: React.FC = () => {
    // State for form inputs, loading status, and navigation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handles the user login process
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
            // Attempt to log in using the user service
            const data = await loginUser({ email, password, rememberMe });

            if (data.success) {
                toast.success("Sikeres bejelentkezés!");
                // Dispatch a global event to notify other parts of the app (e.g., navbar)
                try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
                // Navigate to the home page on successful login
                navigate("/userhomepage");
            } else {
                toast.error(data.error || "Hiba történt");
            }
        } catch (err: unknown) {
            // Handle and display errors from the service or network
            console.error(err);

            const errorObj = err as { status?: number; message?: string };
                
            if (errorObj.status === 403 || errorObj.message === "Account not activated") {
                toast.error("A fiók nincs aktiválva. Kérjük hitelesítse email címét!");
                navigate("/user/sendverify");
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
        <div className={styles.container}>
            <Toaster />
            <form onSubmit={handleLogin} className={styles.form}>
                <h1>Felhasználó bejelentkezés</h1>

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
                        onClick={() => navigate("/user/password/reset")}
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
                        onClick={() => navigate("/UserRegisterPage")}
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
                            onClick={() => navigate("/UserRegisterPage")}
                            style={{ display: 'inline', padding: 0 }}
                        >
                            Regisztráljon itt
                        </Button>
                    </p>

                    <div className={styles.divider} />

                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate("/CompanyLoginPage")}
                    >
                        Váltás céges nézetre
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserLoginPage;