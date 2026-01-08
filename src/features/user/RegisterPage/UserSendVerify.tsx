import React, { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { sendVerificationEmail } from "../../../services/emailService";
import styles from "./UserRegisterPage.module.css"; // Reusing your styles

//components
import InputField from "../../../components/InputField/InputField";
import Button from "../../../components/Button/Button.tsx";

const UserSendVerify: React.FC = () => {
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
            await sendVerificationEmail(email);
            toast.success("Hitelesítő link elküldve az email címére!");
            setEmail("");
        } catch (error) {
            console.error(error); // töröld ki ezt a sort és meglátod mi lesz (TEDD MEG!)
            toast.error("Hiba történt a küldés során!");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <Toaster />
            <div className={styles.container}>
                <div className={styles.card}>
                    <header className={styles.header}>
                        <h1>E-mail hitelesítés</h1>
                        <p>Kérjük, adja meg az email címét a hitelesítő link újraküldéséhez.</p>
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
        </div>
    );
};

export default UserSendVerify;