import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { z } from "zod";
import styles from "./CompanyRegisterPage.module.css";

// Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Button/Button.tsx";
import TextArea from "../../../components/TextArea/TextArea";

import { registerCompany } from "../../../api/companyApi.ts";
import { companyRegisterObject, companyRegisterSchema } from "../../../validation/Validation.ts";

const stepSchemas = [
    // Use companyRegisterObject because it supports .pick()
    companyRegisterObject.pick({ email: true, password: true, confirmPassword: true }),

    companyRegisterObject.pick({ name: true, address: true, taxNumber: true, website: true }),

    companyRegisterObject.pick({
        contactPersonName: true,
        phoneNumber: true,
        activityScope: true,
        shortDescription: true,
        termsAccepted: true
    })
];

const CompanyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        address: "",
        taxNumber: "",
        contactPersonName: "",
        activityScope: "",
        website: "",
        shortDescription: "",
        phoneNumber: "",
        termsAccepted: false
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
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
        if (errors.termsAccepted) setErrors(prev => ({ ...prev, termsAccepted: "" }));
    };

    const validateStep = (currentStep: number) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            // We use .parse(formData) - Zod will ignore extra fields not in the .pick()
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

        // Final validation against the FULL schema to catch cross-field issues (like password mismatch)
        const result = companyRegisterSchema.safeParse(formData);

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
            await registerCompany({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                address: formData.address,
                tax_number: formData.taxNumber,
                contact_person_name: formData.contactPersonName,
                activity_scope: formData.activityScope,
                website: formData.website,
                short_description: formData.shortDescription,
                phone_number: formData.phoneNumber,
                terms_accepted: formData.termsAccepted
            });
            toast.success("Sikeres cégregisztráció!");
            setTimeout(() => navigate("/CompanyLoginPage"), 1500);
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
                        <h1>Cég regisztráció</h1>
                        <p>Lépés {step} / 3: {step === 1 ? "Fiók adatok" : step === 2 ? "Cég adatok" : "Kapcsolattartás"}</p>
                        <div className={styles.stepper}>
                            <div className={`${styles.step} ${step >= 1 ? styles.active : ""}`} />
                            <div className={`${styles.step} ${step >= 2 ? styles.active : ""}`} />
                            <div className={`${styles.step} ${step >= 3 ? styles.active : ""}`} />
                        </div>
                    </header>

                    <form onSubmit={handleRegister} className={styles.form}>
                        {step === 1 && (
                            <section className={styles.section}>
                                <InputField
                                    label="Email cím *" name="email" type="email"
                                    value={formData.email} onChange={handleChange}
                                    error={errors.email}
                                />
                                <div className={styles.row}>
                                    <InputField
                                        label="Jelszó *" name="password" type="password"
                                        value={formData.password} onChange={handleChange}
                                        error={errors.password}
                                    />
                                    <InputField
                                        label="Megerősítés *" name="confirmPassword" type="password"
                                        value={formData.confirmPassword} onChange={handleChange}
                                        error={errors.confirmPassword}
                                    />
                                </div>
                            </section>
                        )}

                        {step === 2 && (
                            <section className={styles.section}>
                                <InputField label="Cégnév *" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                                <InputField label="Székhely címe *" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                                <div className={styles.row}>
                                    <InputField label="Adószám *" name="taxNumber" value={formData.taxNumber} onChange={handleChange} error={errors.taxNumber} />
                                    <InputField label="Weboldal" name="website" value={formData.website} onChange={handleChange} error={errors.website} />
                                </div>
                            </section>
                        )}

                        {step === 3 && (
                            <section className={styles.section}>
                                <div className={styles.row}>
                                    <InputField label="Kapcsolattartó neve *" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} error={errors.contactPersonName} />
                                    <InputField label="Telefonszám *" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
                                </div>
                                <InputField label="Tevékenységi kör *" name="activityScope" value={formData.activityScope} onChange={handleChange} error={errors.activityScope} />
                                <TextArea label="Rövid bemutatkozás *" name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} error={errors.shortDescription} />

                                <div className={`${styles.terms} ${errors.termsAccepted ? styles.errorShake : ""}`}>
                                    <Checkbox label="Elfogadom a felhasználási feltételeket" checked={formData.termsAccepted} onChange={handleCheckboxChange} />
                                    {errors.termsAccepted && <span className={styles.errorText}>{errors.termsAccepted}</span>}
                                </div>
                            </section>
                        )}

                        <div className={styles.footer}>
                            {step > 1 && (
                                <Button type="button" variant="secondary" color={"orion-blue"} onClick={prevStep}>Vissza</Button>
                            )}
                            {step < 3 ? (
                                <Button type="button" variant="primary" color={"orion-blue"} onClick={nextStep}>Folytatás</Button>
                            ) : (
                                <Button type="submit" isLoading={isLoading} variant="primary" color={"orion-blue"}>Regisztráció befejezése</Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegisterPage;