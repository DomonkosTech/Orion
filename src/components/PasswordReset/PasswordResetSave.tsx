import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("A jelszavak nem egyeznek!");
            return;
        }

        if (password.length < 6) {
            toast.error("A jelszónak legalább 6 karakter hosszúnak kell lennie!");
            return;
        }

        const token = searchParams.get("token");
        if (!token) {
            toast.error("Érvénytelen vagy hiányzó token!");
            return;
        }

        try {
            await onSavePassword(token, password);
            toast.success("Sikeres jelszóváltoztatás!");
            navigate(redirectPath);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Hiba történt a jelszó mentése közben.";
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
                        <h2 className={styles.title}>Új jelszó megadása</h2>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label htmlFor="password">Új jelszó</label>
                                <InputField
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Add meg az új jelszót"
                                    required
                                />
                            </div>

                            <div className={styles.field}>
                                <label htmlFor="confirmPassword">Jelszó megerősítése</label>
                                <InputField
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Add meg újra a jelszót"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                color={"orion-blue"}
                                style={{ width: '100%' }}
                            >
                                Jelszó mentése
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PasswordResetSave;