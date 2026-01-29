import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import styles from "./PasswordResetRequest.module.css";

// components
import InputField from "../InputField/InputField";
import Button from "../Button/Button";
import { Header } from "../Header/Header";

interface PasswordResetRequestProps {
    onSendEmail: (email: string) => Promise<void>;
    title?: string;
    description?: string;
    successMessage?: string;
}

const PasswordResetRequest: React.FC<PasswordResetRequestProps> = ({
    onSendEmail,
    title = "Jelszó csere",
    description = "Kérjük, adja meg az email címét a jelszó cserélő link újraküldéséhez.",
    successMessage = "Link elküldve az email címére!"
}) => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Kérjük, adjon meg egy email címet!");
            return;
        }

        setIsLoading(true);
        try {
            await onSendEmail(email);
            toast.success(successMessage);
            setEmail("");
        } catch (error) {
            console.error(error);
            toast.error("Hiba történt a küldés során!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Header />
            <Toaster />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <div className={styles.card}>
                        <header className={styles.header}>
                            <h1>{title}</h1>
                            <p>{description}</p>
                        </header>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <section className={styles.section}>
                                <InputField
                                    label="Email cím"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="pelda@email.hu"
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
                                    Link küldése
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