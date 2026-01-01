import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./UserRegisterPage.module.css";

// Shared Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Button/Button.tsx";
import TextArea from "../../../components/TextArea/TextArea";

// Import the service and type for user registration
import { registerUser, type UserRegistrationData } from "../../../services/userServise";

const UserRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // State to hold all form data for the registration process
    const [formData, setFormData] = useState<UserRegistrationData & { confirmPassword: "" }>({
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
        personal_id: "",
        address_card_number: "",
        terms_accepted: false
    });

    // Handles changes for standard input and textarea fields
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handles changes for the terms and conditions checkbox
    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, terms_accepted: checked }));
    };

    // Handles the user registration submission
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic form validation
        if (!formData.email || !formData.password || !formData.lname || !formData.fname || !formData.personal_id || !formData.address_card_number) {
            toast.error("Kérlek, töltsd ki a kötelező mezőket!");
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error("A jelszavak nem egyeznek!");
            return;
        }
        if (!formData.terms_accepted) {
            toast.error("El kell fogadnia a felhasználási feltételeket!");
            return;
        }

        setIsLoading(true);

        try {
            // Use the registration service to create the user
            await registerUser(formData);

            toast.success("Sikeres regisztráció! Bejelentkezés...");
            // Redirect to login page after a short delay
            setTimeout(() => navigate("/UserLoginPage"), 1500);

        } catch (err: unknown) {
            // Handle and display errors from the service or network
            console.error(err);
            if (err instanceof Error) {
                toast.error(err.message);
            } else {
                toast.error("Hálózati hiba történt");
            }
        } finally {
            // Stop the loading indicator
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

                        <div className={styles.divider} />

                        <InputField
                            label="Személyi igazolvány szám *"
                            name="personal_id"
                            value={formData.personal_id}
                            onChange={handleChange}
                            required
                        />

                        <InputField
                            label="Lakcímkártya szám *"
                            name="address_card_number"
                            value={formData.address_card_number}
                            onChange={handleChange}
                            required
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
                            maxLength={250}
                            placeholder="Írjon magáról pár mondatot..."
                        />
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.terms}>
                        <Checkbox
                            label="Elfogadom a"
                            checked={formData.terms_accepted}
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
