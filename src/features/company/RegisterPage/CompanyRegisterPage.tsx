import React from "react";
import { registerCompany } from "../../../api/companyApi.ts";
import { companyRegisterObject, companyRegisterSchema, passwordConfirmRefinement } from "../../../validation/Validation.ts";
import RegisterPage from "../../../components/RegisterPage/RegisterPage.tsx";
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import TextArea from "../../../components/TextArea/TextArea";
import styles from "./CompanyRegisterPage.module.css";
import registerStyles from "../../../components/RegisterPage/RegisterPage.module.css";

const stepSchemas = [
    companyRegisterObject.pick({ email: true, password: true, confirmPassword: true }).superRefine(passwordConfirmRefinement),
    companyRegisterObject.pick({ name: true, address: true, tax_number: true, website: true }),
    companyRegisterObject.pick({
        contact_person_name: true,
        phone_number: true,
        activity_scope: true,
        short_description: true,
        terms_accepted: true
    })
];

const CompanyRegisterPage: React.FC = () => {
    const initialValues = {
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        address: "",
        tax_number: "",
        contact_person_name: "",
        activity_scope: "",
        website: "",
        short_description: "",
        phone_number: "",
        terms_accepted: false
    };

    const steps = [
        {

            label: "Fiók adatok",
            render: ({ formData, handleChange, errors }: any) => {
                const password = formData.password || "";
                const hasMinLength = password.length >= 8;
                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecial = /[^a-zA-Z0-9]/.test(password);

                return (
                    <>
                        <InputField
                            label="Email cím *" name="email" type="email"
                            value={formData.email} onChange={handleChange}
                            error={errors.email}
                        />
                        <div className={styles.row}>
                            <InputField
                                label="Jelszó *" name="password" isPassword
                                value={formData.password} onChange={handleChange}
                                error={errors.password}
                            />
                            <InputField
                                label="Megerősítés *" name="confirmPassword" isPassword
                                value={formData.confirmPassword} onChange={handleChange}
                                error={errors.confirmPassword}
                            />
                        </div>
                        <div className={registerStyles.passwordRequirements}>
                            <p>Jelszó követelmények:</p>
                            <ul>
                                <li className={hasMinLength ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasMinLength ? "✓" : "○"}</span> Legalább 8 karakter
                                </li>
                                <li className={hasLower ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasLower ? "✓" : "○"}</span> Kisbetű
                                </li>
                                <li className={hasUpper ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasUpper ? "✓" : "○"}</span> Nagybetű
                                </li>
                                <li className={hasNumber ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasNumber ? "✓" : "○"}</span> Szám
                                </li>
                                <li className={hasSpecial ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasSpecial ? "✓" : "○"}</span> Speciális karakter
                                </li>
                            </ul>
                        </div>
                    </>
                );
            }
        },
        {
            label: "Cég adatok",
            render: ({ formData, handleChange, errors }: any) => (
                <>
                    <InputField label="Cégnév *" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                    <InputField label="Székhely címe *" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                    <div className={styles.row}>
                        <InputField label="Adószám *" name="tax_number" value={formData.tax_number} onChange={handleChange} error={errors.tax_number} />
                        <InputField label="Weboldal" name="website" value={formData.website} onChange={handleChange} error={errors.website} />
                    </div>
                </>
            )
        },
        {
            label: "Kapcsolattartás",
            render: ({ formData, handleChange, handleCheckboxChange, errors }: any) => (
                <>
                    <div className={styles.row}>
                        <InputField label="Kapcsolattartó neve *" name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} error={errors.contact_person_name} />
                        <InputField label="Telefonszám *" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
                    </div>
                    <InputField label="Tevékenységi kör *" name="activity_scope" value={formData.activity_scope} onChange={handleChange} error={errors.activity_scope} />
                    <TextArea label="Rövid bemutatkozás *" name="short_description" value={formData.short_description} onChange={handleChange} rows={3} error={errors.short_description} />

                    <div className={`${styles.terms} ${errors.terms_accepted ? styles.errorShake : ""}`}>
                        <Checkbox label="Elfogadom a felhasználási feltételeket" checked={formData.terms_accepted} onChange={(checked) => handleCheckboxChange("terms_accepted", checked)} />
                        {errors.terms_accepted && <span className={styles.errorText}>{errors.terms_accepted}</span>}
                    </div>
                </>
            )
        }
    ];

    const handleCompanyRegister = async (data: any) => {
        await registerCompany({
            email: data.email,
            password: data.password,
            confirmPassword: data.confirmPassword,
            name: data.name,
            address: data.address,
            tax_number: data.tax_number,
            contact_person_name: data.contact_person_name,
            activity_scope: data.activity_scope,
            website: data.website,
            short_description: data.short_description,
            phone_number: data.phone_number,
            terms_accepted: data.terms_accepted
        });
    };

    return (
        <RegisterPage
            initialValues={initialValues}
            steps={steps}
            stepSchemas={stepSchemas}
            finalSchema={companyRegisterSchema}
            onSubmit={handleCompanyRegister}
            redirectPath="/CompanyLoginPage"
            title="Cég regisztráció"
            loginPath="/CompanyLoginPage"
        />
    );
};

export default CompanyRegisterPage;