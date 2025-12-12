import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserRegisterPage.module.css";

// Shared Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/buttons/button";
import TextArea from "../../../components/TextArea/TextArea";

const UserRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Updated state to match backend requirements
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        lname: "",
        fname: "",
        birth_place: "",
        birth_date: "",
        address: "",
        phone_number: "",
        tax_number: "",
        nationality: "",
        qualifications: "",
        short_bio: "",
        termsAccepted: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Basic Validation
        if (!formData.email || !formData.password || !formData.lname || !formData.fname) {
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
            // 2. Register User Data
            const userResponse = await fetch("http://localhost:4000/api/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    lname: formData.lname,
                    fname: formData.fname,
                    phone_number: formData.phone_number,
                    birth_place: formData.birth_place,
                    birth_date: formData.birth_date,
                    address: formData.address,
                    tax_number: formData.tax_number,
                    nationality: formData.nationality,
                    short_bio: formData.short_bio,
                    qualifications: formData.qualifications,
                    terms_accepted: formData.termsAccepted
                }),
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userData.error || "Hiba a felhasználói regisztráció során");
            }

            // 3. Save Credentials
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
                    <p>Töltse ki adatait a csatlakozáshoz</p>
                </div>

                <div className={styles.grid}>
                    {/* Left Column: Identity & Account */}
                    <div className={styles.section}>
                        <h3>Fiók & Személyes adatok</h3>

                        <InputField
                            label="Vezetéknév *"
                            name="lname"
                            value={formData.lname}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Keresztnév *"
                            name="fname"
                            value={formData.fname}
                            onChange={handleChange}
                            required
                        />
                        <div className={styles.row}>
                            <InputField
                                label="Születési hely"
                                name="birth_place"
                                value={formData.birth_place}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Születési idő"
                                name="birth_date"
                                type="date"
                                value={formData.birth_date}
                                onChange={handleChange}
                            />
                        </div>
                        <InputField
                            label="Állampolgárság"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleChange}
                        />

                        {/* Account credentials moved here to keep context together */}
                        <div className={styles.divider} />

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

                    {/* Right Column: Contact & Professional */}
                    <div className={styles.section}>
                        <h3>Elérhetőség & Profil</h3>

                        <InputField
                            label="Lakcím"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        <div className={styles.row}>
                            <InputField
                                label="Telefonszám"
                                name="phone_number"
                                type="tel"
                                value={formData.phone_number}
                                onChange={handleChange}
                            />
                            <InputField
                                label="Adószám"
                                name="tax_number"
                                value={formData.tax_number}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.divider} />

                        <InputField
                            label="Végzettségek / Képesítések"
                            name="qualifications"
                            placeholder="pl. Egyetem, Tanfolyam..."
                            value={formData.qualifications}
                            onChange={handleChange}
                        />

                        <TextArea
                            label="Rövid bemutatkozás"
                            name="short_bio"
                            value={formData.short_bio}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Írjon magáról pár mondatot..."
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
