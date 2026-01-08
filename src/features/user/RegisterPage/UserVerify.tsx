import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../../services/emailService";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserRegisterPage.module.css";

const UserVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isVerifying = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (token && !isVerifying.current) {
            isVerifying.current = true;

            verifyEmail(token)
                .then(() => {
                    toast.success("Sikeres e-mail igazolás!");
                    setTimeout(() => navigate("/UserLoginPage"), 2000);
                })
                .catch((error) => {
                    toast.error("Hiba történt: " + error.message);
                });
        }
    }, [searchParams, navigate]);

    return (
        <div className={styles.page}>
            <Toaster />
            <div className={styles.container}>
                <div className={styles.card} style={{ textAlign: 'center' }}>
                    <header className={styles.header}>
                        <h1>Fiók aktiválása</h1>
                        <div className={styles.section} style={{ marginTop: '2rem' }}>
                            <p>E-mail ellenőrzése folyamatban...</p>
                            {/* You could add a Spinner component here */}
                            <div className={styles.stepper}>
                                <div className={`${styles.step} ${styles.active}`} style={{ width: '100px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        </div>
                    </header>
                </div>
            </div>
        </div>
    );
};

export default UserVerify;