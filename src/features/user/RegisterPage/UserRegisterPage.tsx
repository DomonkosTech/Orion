import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";
import styles from "./UserRegisterPage.module.css";

// components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Button/Button.tsx";
import TextArea from "../../../components/TextArea/TextArea";

import { registerUser } from "../../../api/userApi.ts";
import { userRegisterObject, userRegisterSchema } from "../../../validation/Validation.ts";

const stepSchemas = [
    userRegisterObject.pick({ email: true, password: true, confirmPassword: true }),
    userRegisterObject.pick({ lname: true, fname: true, birth_place: true, birth_date: true, personal_id: true, address_card_number: true, nationality: true }),
    userRegisterObject.pick({ address: true, phone_number: true, tax_number: true, qualifications: true, short_bio: true, terms_accepted: true })
];

const UserRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        personal_id: "",
        address_card_number: "",
        terms_accepted: false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, terms_accepted: checked }));
        if (errors.terms_accepted) setErrors(prev => ({ ...prev, terms_accepted: "" }));
    };

    const validateStep = (currentStep: number) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {};
                err.errors.forEach((error) => {
                    if (error.path[0]) {
                        formattedErrors[error.path[0] as string] = error.message;
                    }
                });
                setErrors(formattedErrors);
                toast.error("Kérjük, javítsa a hibákat a továbblépéshez!");
            }
            return false;
        }
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(s => s + 1);
        }
    };

    const prevStep = () => {
        setErrors({});
        setStep(s => s - 1);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Final validation against the FULL schema (catches password mismatch)
        const result = userRegisterSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
                if (error.path[0]) {
                    formattedErrors[error.path[0] as string] = error.message;
                }
            });
            setErrors(formattedErrors);
            toast.error("Ellenőrizze az adatokat!");
            return;
        }

        setIsLoading(true);
        try {
            await registerUser(formData);
            toast.success("Sikeres regisztráció!");
            setTimeout(() => navigate("/UserLoginPage"), 1500);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : "Hálózati hiba történt");
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
                        <h1>Fiók létrehozása</h1>
                        <p>Lépés {step} / 3: {step === 1 ? "Fiók adatok" : step === 2 ? "Személyes adatok" : "Szakmai profil"}</p>
                        <div className={styles.stepper}>
                            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`} />
                            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`} />
                            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`} />
                        </div>
                    </header>

                    <form onSubmit={handleRegister} className={styles.form}>
                        {step === 1 && (
                            <section className={styles.section}>
                                <InputField label="Email cím *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                                <div className={styles.row}>
                                    <InputField label="Jelszó *" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password} />
                                    <InputField label="Megerősítés *" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                                </div>
                            </section>
                        )}

                        {step === 2 && (
                            <section className={styles.section}>
                                <div className={styles.row}>
                                    <InputField label="Vezetéknév *" name="lname" value={formData.lname} onChange={handleChange} error={errors.lname} />
                                    <InputField label="Keresztnév *" name="fname" value={formData.fname} onChange={handleChange} error={errors.fname} />
                                </div>
                                <div className={styles.row}>
                                    <InputField label="Születési hely" name="birth_place" value={formData.birth_place} onChange={handleChange} error={errors.birth_place} />
                                    <InputField label="Születési idő" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} error={errors.birth_date} />
                                </div>
                                <InputField label="Nemzetiség *" name="nationality" value={formData.nationality} onChange={handleChange} error={errors.nationality} />
                                <InputField label="Személyi igazolvány szám *" name="personal_id" value={formData.personal_id} onChange={handleChange} error={errors.personal_id} />
                                <InputField label="Lakcímkártya szám *" name="address_card_number" value={formData.address_card_number} onChange={handleChange} error={errors.address_card_number} />
                            </section>
                        )}

                        {step === 3 && (
                            <section className={styles.section}>
                                <InputField label="Lakcím" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                                <div className={styles.row}>
                                    <InputField label="Telefonszám" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
                                    <InputField label="Adószám" name="tax_number" value={formData.tax_number} onChange={handleChange} error={errors.tax_number} />
                                </div>
                                <InputField label="Végzettségek" name="qualifications" value={formData.qualifications} onChange={handleChange} error={errors.qualifications} />
                                <TextArea label="Rövid bemutatkozás" name="short_bio" value={formData.short_bio} onChange={handleChange} rows={3} error={errors.short_bio} />

                                <div className={`${styles.terms} ${errors.terms_accepted ? styles.errorShake : ""}`}>
                                    <Checkbox label="Elfogadom a felhasználási feltételeket" checked={formData.terms_accepted} onChange={handleCheckboxChange} />
                                    {errors.terms_accepted && <span className={styles.errorText}>{errors.terms_accepted}</span>}
                                </div>
                            </section>
                        )}

                        <div className={styles.footer}>
                            {step > 1 && <Button type="button" variant="secondary" color="orion-blue" onClick={prevStep}>Vissza</Button>}
                            {step < 3 ? (
                                <Button type="button" variant="primary" color="orion-blue" onClick={nextStep}>Folytatás</Button>
                            ) : (
                                <Button type="submit" isLoading={isLoading} variant="primary" color="orion-blue">Regisztráció befejezése</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserRegisterPage;