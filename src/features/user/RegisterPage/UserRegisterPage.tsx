import React from "react";
import { useTranslation } from "react-i18next";
import { registerUser } from "../../../Api/userApi.ts";
import { userRegisterObject, userRegisterSchema, passwordConfirmRefinement } from "../../../validation/Validation.ts";
import RegisterPage from "../../../components/RegisterPage/RegisterPage.tsx";
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import TextArea from "../../../components/TextArea/TextArea";
import styles from "./UserRegisterPage.module.css";
import registerStyles from "../../../components/RegisterPage/RegisterPage.module.css";

const stepSchemas = [
    userRegisterObject.pick({ email: true, password: true, confirmPassword: true }).superRefine(passwordConfirmRefinement),
    userRegisterObject.pick({ lname: true, fname: true, birth_place: true, birth_date: true, personal_id: true, address_card_number: true, nationality: true }),
    userRegisterObject.pick({ address: true, phone_number: true, tax_number: true, qualifications: true, short_bio: true, terms_accepted: true })
];

const UserRegisterPage: React.FC = () => {
    const { t } = useTranslation('user');
    const initialValues = {
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
    };

    const steps = [
        {
            label: t('register.steps.account'),
            render: ({ formData, handleChange, errors }: any) => {
                const password = formData.password || "";
                const hasMinLength = password.length >= 8;
                const hasLower = /[a-z]/.test(password);
                const hasUpper = /[A-Z]/.test(password);
                const hasNumber = /[0-9]/.test(password);
                const hasSpecial = /[^a-zA-Z0-9]/.test(password);

                return (
                    <>
                        <InputField label={t('register.fields.email')} name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        <div className={styles.row}>
                            <InputField label={t('register.fields.password')} name="password" isPassword value={formData.password} onChange={handleChange} error={errors.password} />
                            <InputField label={t('register.fields.confirmPassword')} name="confirmPassword" isPassword value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
                        </div>
                        <div className={registerStyles.passwordRequirements}>
                            <p>{t('register.passwordRequirements.title')}</p>
                            <ul>
                                <li className={hasMinLength ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasMinLength ? "✓" : "○"}</span> {t('register.passwordRequirements.minLength')}
                                </li>
                                <li className={hasLower ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasLower ? "✓" : "○"}</span> {t('register.passwordRequirements.lowercase')}
                                </li>
                                <li className={hasUpper ? registerStyles.reqMet : registerStyles.reqUnmet}>
                                    <span className={registerStyles.reqIcon}>{hasUpper ? "✓" : "○"}</span> {t('register.passwordRequirements.uppercase')}
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
            label: t('register.steps.personal'),
            render: ({ formData, handleChange, errors }: any) => (
                <>
                    <div className={styles.row}>
                        <InputField label={t('register.fields.lastName')} name="lname" value={formData.lname} onChange={handleChange} error={errors.lname} />
                        <InputField label={t('register.fields.firstName')} name="fname" value={formData.fname} onChange={handleChange} error={errors.fname} />
                    </div>
                    <div className={styles.row}>
                        <InputField label={t('register.fields.birthPlace')} name="birth_place" value={formData.birth_place} onChange={handleChange} error={errors.birth_place} />
                        <InputField label={t('register.fields.birthDate')} name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} error={errors.birth_date} />
                    </div>
                    <InputField label={t('register.fields.nationality')} name="nationality" value={formData.nationality} onChange={handleChange} error={errors.nationality} />
                    <InputField label={t('register.fields.personalId')} name="personal_id" value={formData.personal_id} onChange={handleChange} error={errors.personal_id} />
                    <InputField label={t('register.fields.addressCard')} name="address_card_number" value={formData.address_card_number} onChange={handleChange} error={errors.address_card_number} />
                </>
            )
        },
        {
            label: t('register.steps.professional'),
            render: ({ formData, handleChange, handleCheckboxChange, errors }: any) => (
                <>
                    <InputField label={t('register.fields.address')} name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                    <div className={styles.row}>
                        <InputField label={t('register.fields.phone')} name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
                        <InputField label={t('register.fields.taxNumber')} name="tax_number" value={formData.tax_number} onChange={handleChange} error={errors.tax_number} />
                    </div>
                    <InputField label={t('register.fields.qualifications')} name="qualifications" value={formData.qualifications} onChange={handleChange} error={errors.qualifications} />
                    <TextArea label={t('register.fields.bio')} name="short_bio" value={formData.short_bio} onChange={handleChange} rows={3} error={errors.short_bio} />

                    <div className={`${styles.terms} ${errors.terms_accepted ? styles.errorShake : ""}`}>
                        <Checkbox label={t('register.fields.terms')} checked={formData.terms_accepted} onChange={(checked) => handleCheckboxChange("terms_accepted", checked)} />
                        {errors.terms_accepted && <span className={styles.errorText}>{errors.terms_accepted}</span>}
                    </div>
                </>
            )
        }
    ];

    return (
        <RegisterPage
            initialValues={initialValues}
            steps={steps}
            stepSchemas={stepSchemas}
            finalSchema={userRegisterSchema}
            onSubmit={registerUser}
            redirectPath="/UserLoginPage"
            title={t('register.title')}
            loginPath="/UserLoginPage"
        />
    );
};

export default UserRegisterPage;