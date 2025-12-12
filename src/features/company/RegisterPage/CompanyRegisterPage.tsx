import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import styles from "./CompanyRegisterPage.module.css";

// Shared Components
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import Button from "../../../components/buttons/button";
import TextArea from "../../../components/TextArea/TextArea";

const CompanyRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form state
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
            // 2. Register Company
            const companyResponse = await fetch("http://localhost:4000/api/company/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    address: formData.address,
                    tax_number: formData.taxNumber,
                    contact_person_name: formData.contactPersonName,
                    activity_scope: formData.activityScope,
                    website: formData.website,
                    short_description: formData.shortDescription,
                    phone_number: formData.phoneNumber,
                    terms_accepted: formData.termsAccepted
                }),
            });

            const companyData = await companyResponse.json();

            if (!companyResponse.ok) {
                throw new Error(companyData.error || "Hiba a céges regisztráció során");
            }

            // 3. Register Credentials
            const credentialsResponse = await fetch("http://localhost:4000/api/company/register/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_id: companyData.companyId,
                    password: formData.password
                }),
            });

            const credentialsData = await credentialsResponse.json();

            if (!credentialsResponse.ok) {
                throw new Error(credentialsData.error || "Hiba a jelszó mentése során");
            }

            toast.success("Sikeres regisztráció! Bejelentkezés...");
            setTimeout(() => navigate("/CompanyLoginPage"), 1500);


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
                    <h1>Cég regisztráció</h1>
                    <p>Hozzon létre fiókot vállalkozása számára</p>
                </div>

                {/* Grid Layout for compact view */}
                <div className={styles.grid}>
                    {/* Column 1: Account Info */}
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

                    {/* Column 2: Company Basic Info */}
                    <div className={styles.section}>
                        <h3>Cégadatok</h3>
                        <InputField
                            label="Cég neve *"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Adószám *"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Weboldal"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Column 3: Contact Info */}
                    <div className={styles.section}>
                        <h3>Elérhetőség</h3>
                        <InputField
                            label="Kapcsolattartó neve *"
                            name="contactPersonName"
                            value={formData.contactPersonName}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Telefonszám *"
                            name="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                        <InputField
                            label="Lakcím *"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Column 4: Details */}
                    <div className={styles.section}>
                        <h3>Tevékenység</h3>
                        <InputField
                            label="Tevékenységi kör *"
                            name="activityScope"
                            value={formData.activityScope}
                            onChange={handleChange}
                            required
                        />
                        <TextArea
                            label="Rövid bemutatkozás *"
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleChange}
                            rows={4}
                            required
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
