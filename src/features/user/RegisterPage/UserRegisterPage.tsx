import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserRegisterPage.module.css";

// Shared Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/buttons/button";

const UserRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form state - Simplified for standard User
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        address: "",
        phoneNumber: "",
        termsAccepted: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation
        if (!formData.email.trim() || !formData.password.trim() || !formData.name.trim()) {
            toast.error("Kérlek, töltsd ki a kötelező mezőket!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("A jelszavak nem egyeznek!");
            return;
        }
        if (!formData.termsAccepted) {
            toast.error("El kell fogadnia a felhasználási feltételeket!");
            return;
        }

        setIsLoading(true);

        try {
            const userResponse = await fetch("http://localhost:4000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    address: formData.address,
                    phone_number: formData.phoneNumber,
                    terms_accepted: formData.termsAccepted
                }),
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userData.error || "Hiba a felhasználói regisztráció során");
            }

            const credentialsResponse = await fetch("http://localhost:4000/api/user/register/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userData.userId,
                    password: formData.password
                }),
            });

            const credentialsData = await credentialsResponse.json();

            if (!credentialsResponse.ok) {
                throw new Error(credentialsData.error || "Hiba a jelszó mentése során");
            }

            toast.success("Sikeres regisztráció! Bejelentkezés...");
            setTimeout(() => navigate("/UserLoginPage"), 1500);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Hálózati hiba történt");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Toaster />
            <form onSubmit={handleRegister} className={styles.form}>
                <div className={styles.header}>
                    <h1>Felhasználó regisztráció</h1>
                    <p>Készítse el profilját a jelentkezéshez</p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.section}>
                        <h3>Fiók adatok</h3>
                        <InputField
                            label="Email cím *"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Jelszó *"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Jelszó megerősítése *"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.section}>
                        <h3>Személyes adatok</h3>
                        <InputField
                            label="Teljes név *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Telefonszám"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                        />
                        <InputField
                            label="Lakcím"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.terms}>
                        <Checkbox
                            label="Elfogadom a"
                            checked={formData.termsAccepted}
                            onChange={handleCheckboxChange}
                        />
                        <a href="/terms" className={styles.link} target="_blank" rel="noreferrer">
                            felhasználási feltételeket
                        </a>
                    </div>

                    <div className={styles.actions}>
                        <Button type="submit" isLoading={isLoading} variant="primary">
                            Regisztráció
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate("/UserLoginPage")}
                        >
                            Vissza a bejelentkezéshez
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UserRegisterPage;