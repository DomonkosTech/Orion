import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyRegisterPage.module.css";

// Shared Components
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/Button/Button.tsx";
import { type CompanyRegisterForm } from "./validation";
import AccountSection from "./components/AccountSection";
import CompanyInfoSection from "./components/CompanyInfoSection";
import ContactSection from "./components/ContactSection";
import ActivitySection from "./components/ActivitySection";
import { registerCompany } from "../../../services/companyService.ts";

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

        // Basic validation: Check if email and password are provided
        if (!formData.email || !formData.password) {
            toast.error("Email and password are required!");
            return;
        }

        setIsLoading(true);

        try {
            // Call the registration service
            await registerCompany({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                address: formData.address,
                tax_number: formData.taxNumber,
                contact_person_name: formData.contactPersonName,
                activity_scope: formData.activityScope,
                website: formData.website || "",
                short_description: formData.shortDescription,
                phone_number: formData.phoneNumber,
                terms_accepted: formData.termsAccepted
            });

            toast.success("Registration successful! Redirecting...");
            setTimeout(() => navigate("/CompanyLoginPage"), 1500);

        } catch (err) {
            console.error(err);
            toast.error("Registration failed");
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
