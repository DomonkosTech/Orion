// CompanyLoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyLoginPage.module.css";

// Services
import { loginCompany, checkAuth, ServiceError } from "../../../services/companyService"; // Adjust path as needed

// Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Buttons/Button.tsx";

const CompanyLoginPage: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error("Kérlek, töltsd ki mindkét mezőt!");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Attempt Login using the Service
            await loginCompany(email, password, rememberMe);

            toast.success("Sikeres bejelentkezés!");

            // 2. Session Confirmation Loop (Optional but safer for race conditions)
            try {
                let confirmed = false;
                for (let i = 0; i < 5; i++) {
                    const checkData = await checkAuth();
                    if (checkData?.loggedIn && checkData?.userType === "company") {
                        confirmed = true;
                        break;
                    }
                    await new Promise((r) => setTimeout(r, 100));
                }
                if (!confirmed) {
                    console.warn("Session not confirmed immediately, navigating anyway.");
                }
            } catch (e) {
                console.warn("Auth check failed", e);
            }

            // 3. Trigger Global Event & Navigate
            try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
            navigate("/company");

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof ServiceError) {
                toast.error(err.message);
            } else {
                toast.error("Váratlan hiba történt. Kérjük próbálja később.");
            }
        } finally {
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