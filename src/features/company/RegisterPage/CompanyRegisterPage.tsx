import React from "react";
import { useTranslation } from "react-i18next";
import { registerCompany } from "../../../Api/companyApi.ts";
import { companyRegisterObject, companyRegisterSchema, passwordConfirmRefinement } from "../../../validation/Validation.ts";
import RegisterPage from "../../../components/RegisterPage/RegisterPage.tsx";
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import TextArea from "../../../components/TextArea/TextArea";
import styles from "./CompanyRegisterPage.module.css";
import registerStyles from "../../../components/RegisterPage/RegisterPage.module.css";

interface CompanyRegisterFormValues {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website: string;
    short_description: string;
    phone_number: string;
    terms_accepted: boolean;
}

interface RenderProps {
    formData: CompanyRegisterFormValues;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (name: string, checked: boolean) => void;
    errors: Record<string, string>;
}

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
    const { t } = useTranslation('company');

    const initialValues: CompanyRegisterFormValues = {
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
            label: t('register.steps.account'),
            render: ({ formData, handleChange, errors }: RenderProps) => {
                const password = formData.password || "";
                const hasMinLength = password.length >= 8;
                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecial = /[^a-zA-Z0-9]/.test(password);

                return (
                    <>
                        <InputField
                            label={t('register.fields.email')} name="email" type="email"
                            value={formData.email} onChange={handleChange}
                            error={errors.email}
                        />
                        <div className={styles.row}>
                            <InputField
                                label={t('register.fields.password')} name="password" isPassword
                                value={formData.password} onChange={handleChange}
                                error={errors.password}
                            />
                            <InputField
                                label={t('register.fields.confirmPassword')} name="confirmPassword" isPassword
                                value={formData.confirmPassword} onChange={handleChange}
                                error={errors.confirmPassword}
                            />
                        </div>
                        <div className={registerStyles.passwordRequirements}>
                            <p>{t('register.passwordRequirements.title')}</p>
                            <ul>
                                <li className={hasMinLength ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasMinLength ? "✓" : "○"}</span> {t('register.passwordRequirements.length')}
                                </li>
                                <li className={hasLower ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasLower ? "✓" : "○"}</span> {t('register.passwordRequirements.lower')}
                                </li>
                                <li className={hasUpper ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasUpper ? "✓" : "○"}</span> {t('register.passwordRequirements.upper')}
                                </li>
                                <li className={hasNumber ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasNumber ? "✓" : "○"}</span> {t('register.passwordRequirements.number')}
                                </li>
                                <li className={hasSpecial ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasSpecial ? "✓" : "○"}</span> {t('register.passwordRequirements.special')}
                                </li>
                            </ul>
                        </div>
                    </>
                );
            }
        },
        {
            label: t('register.steps.company'),
            render: ({ formData, handleChange, errors }: RenderProps) => (
                <>
                    <InputField label={t('register.fields.companyName')} name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                    <InputField label={t('register.fields.address')} name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                    <div className={styles.row}>
                        <InputField label={t('register.fields.taxNumber')} name="tax_number" value={formData.tax_number} onChange={handleChange} error={errors.tax_number} />
                        <InputField label={t('register.fields.website')} name="website" value={formData.website} onChange={handleChange} error={errors.website} />
                    </div>
                </>
            )
        },
        {
            label: t('register.steps.contact'),
            render: ({ formData, handleChange, handleCheckboxChange, errors }: RenderProps) => (
                <>
                    <div className={styles.row}>
                        <InputField label={t('register.fields.contactPerson')} name="contact_person_name" value={formData.contact_person_name} onChange={handleChange} error={errors.contact_person_name} />
                        <InputField label={t('register.fields.phone')} name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
                    </div>
                    <InputField label={t('register.fields.activityScope')} name="activity_scope" value={formData.activity_scope} onChange={handleChange} error={errors.activity_scope} />
                    <TextArea label={t('register.fields.shortDescription')} name="short_description" value={formData.short_description} onChange={handleChange} rows={3} error={errors.short_description} />

                    <div className={`${styles.terms} ${errors.terms_accepted ? styles.errorShake : ""}`}>
                        <Checkbox label={t('register.fields.terms')} checked={formData.terms_accepted} onChange={(checked) => handleCheckboxChange("terms_accepted", checked)} />
                        {errors.terms_accepted && <span className={styles.errorText}>{errors.terms_accepted}</span>}
                    </div>
                </>
            )
        }
    ];

    const handleCompanyRegister = async (data: CompanyRegisterFormValues) => {
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
            title={t('register.title')}
            loginPath="/CompanyLoginPage"
        />
    );
};

export default CompanyRegisterPage;