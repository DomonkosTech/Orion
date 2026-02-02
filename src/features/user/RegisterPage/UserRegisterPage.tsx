import React from "react";
import { registerUser } from "../../../api/userApi.ts";
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
                        <InputField label="Email cím *" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        <div className={styles.row}>
                            <InputField label="Jelszó *" name="password" isPassword value={formData.password} onChange={handleChange} error={errors.password} />
                            <InputField label="Megerősítés *" name="confirmPassword" isPassword value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} />
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
            label: "Személyes adatok",
            render: ({ formData, handleChange, errors }: any) => (
                <>
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
                </>
            )
        },
        {
            label: "Szakmai profil",
            render: ({ formData, handleChange, handleCheckboxChange, errors }: any) => (
                <>
                    <InputField label="Lakcím" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                    <div className={styles.row}>
                        <InputField label="Telefonszám" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} error={errors.phone_number} />
                        <InputField label="Adószám" name="tax_number" value={formData.tax_number} onChange={handleChange} error={errors.tax_number} />
                    </div>
                    <InputField label="Végzettségek" name="qualifications" value={formData.qualifications} onChange={handleChange} error={errors.qualifications} />
                    <TextArea label="Rövid bemutatkozás" name="short_bio" value={formData.short_bio} onChange={handleChange} rows={3} error={errors.short_bio} />

                    <div className={`${styles.terms} ${errors.terms_accepted ? styles.errorShake : ""}`}>
                        <Checkbox label="Elfogadom a felhasználási feltételeket" checked={formData.terms_accepted} onChange={(checked) => handleCheckboxChange("terms_accepted", checked)} />
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
            title="Fiók létrehozása"
            loginPath="/UserLoginPage"
        />
    );
};

export default UserRegisterPage;