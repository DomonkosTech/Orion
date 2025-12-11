import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserLoginPage.module.css";

// Import Shared Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/buttons/button";

const UserLoginPage: React.FC = () => {
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
            const res = await fetch("http://localhost:4000/api/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password, rememberMe }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Sikeres bejelentkezés!");
                // Dispatch auth event so the navbar/app knows we logged in
                try { window.dispatchEvent(new Event("auth-changed")); } catch { /* empty */ }
                navigate("/");
            } else {
                toast.error(data.error || "Hiba történt");
            }
        } catch (err: unknown) {
            console.error(err);
            const message = err instanceof Error ? err.message : "Hálózati hiba történt";
            toast.error(message);
        } finally {
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
                        type="password"
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
                        onClick={() => toast("Elfelejtett jelszó funkció hamarosan!")}
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