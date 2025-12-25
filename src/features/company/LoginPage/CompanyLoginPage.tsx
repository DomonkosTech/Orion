// CompanyLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyLoginPage.module.css";

// Services
import { loginCompany} from "../../../services/companyService";

// Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Buttons/Button.tsx";

const CompanyLoginPage: React.FC = () => {
    // State for form inputs, loading status, and navigation
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Handles the company login process
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic form validation
        if (!email.trim() || !password.trim()) {
            toast.error("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        setIsLoading(true);

        try {
            // Attempt to log in using the company service
            await loginCompany({email, password, rememberMe});

            toast.success("Sikeres bejelentkezés!");

            // Dispatch a global event to notify other parts of the app (e.g., navbar)
            try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
            
            // Navigate to the company dashboard on successful login
            navigate("/company");

        } catch (err: unknown) {
            // Handle and display errors from the service or network
            console.error(err);
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
            <form onSubmit={handleLogin} className={styles.form} noValidate>
                <h1>Cég bejelentkezés</h1>

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
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.optionsRow}>
                    <Checkbox
                        label="Emlékezz rám"
                        checked={rememberMe}
                        onChange={setRememberMe}
                    />

                    <Button
                        type="button"
                        variant="link"
                        onClick={() => toast("Elfelejtett jelszó funkció hamarosan!")}
                    >
                        Elfelejtette jelszavát?
                    </Button>
                </div>

                <div className={styles.actions}>
                    <Button type="submit" isLoading={isLoading} variant="primary">
                        Bejelentkezés
                    </Button>
                </div>

                <div className={styles.footer}>
                    <p>
                        Nincs még fiókja?{" "}
                        <Button
                            type="button"
                            variant="link"
                            onClick={() => navigate("/CompanyRegisterPage")}
                        >
                            Regisztráljon itt
                        </Button>
                    </p>

                    <div className={styles.divider} />

                    <Button
                        type="button"
                        variant="link"
                        onClick={() => navigate("/UserLoginPage")}
                    >
                        Váltás felhasználó nézetre
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CompanyLoginPage;