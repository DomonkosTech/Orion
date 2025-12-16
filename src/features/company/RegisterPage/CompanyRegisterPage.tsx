import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyRegisterPage.module.css";

// Shared Components
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Buttons/Button.tsx";
import { registerCompany, registerCompanyCredentials, ServiceError } from "../../../services/companyService";
import { companyRegisterSchema, type CompanyRegisterForm } from "./validation";
import AccountSection from "./components/AccountSection";
import CompanyInfoSection from "./components/CompanyInfoSection";
import ContactSection from "./components/ContactSection";
import ActivitySection from "./components/ActivitySection";

const CompanyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [formData, setFormData] = useState<CompanyRegisterForm>({
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

    // Handle text inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle specific checkbox change (since our Checkbox component returns boolean)
    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, termsAccepted: checked }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validation with Zod
        const parsed = companyRegisterSchema.safeParse(formData);
        if (!parsed.success) {
            toast.error(parsed.error.issues[0]?.message || "Érvénytelen űrlap adatok");
            return;
        }

        setIsLoading(true);

        try {
            // 2. Register Company via service (trims strings, handles dates)
            // `parsed.data` now contains the validated and transformed (trimmed) data
            const { data: validatedData } = parsed;
            const companyData = await registerCompany({
                email: validatedData.email,
                name: validatedData.name,
                address: validatedData.address,
                tax_number: validatedData.taxNumber,
                contact_person_name: validatedData.contactPersonName,
                activity_scope: validatedData.activityScope,
                website: validatedData.website || undefined,
                short_description: validatedData.shortDescription,
                phone_number: validatedData.phoneNumber,
                terms_accepted: validatedData.termsAccepted
            });

            // 3. Register Credentials
            await registerCompanyCredentials(companyData.companyId, validatedData.password);

            toast.success("Sikeres regisztráció! Bejelentkezés...");
            setTimeout(() => navigate("/CompanyLoginPage"), 1500);

        } catch (err: unknown) {
            console.error(err);
            if (err instanceof ServiceError) {
                if (err.status === 409) {
                    toast.error("E-mail cím már foglalt");
                } else {
                    toast.error(err.message);
                }
            } else if (err instanceof Error) {
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
            <form onSubmit={handleRegister} className={styles.form} noValidate>
                <div className={styles.header}>
                    <h1>Cég regisztráció</h1>
                    <p>Hozzon létre fiókot vállalkozása számára</p>
                </div>

                {/* Grid Layout for compact view */}
                <fieldset className={styles.grid} disabled={isLoading}>
                    <AccountSection formData={formData} onChange={handleChange} />
                    <CompanyInfoSection formData={formData} onChange={handleChange} />
                    <ContactSection formData={formData} onChange={handleChange} />
                    <ActivitySection formData={formData} onChange={handleChange} />
                </fieldset>

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
                        <Button type="submit" isLoading={isLoading} variant="primary" disabled={isLoading}>
                            Regisztráció
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isLoading}
                            onClick={() => navigate("/CompanyLoginPage")}
                        >
                            Vissza a bejelentkezéshez
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CompanyRegisterPage;
