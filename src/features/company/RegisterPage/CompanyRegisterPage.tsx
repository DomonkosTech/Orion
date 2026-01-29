import React from "react";
import { registerCompany } from "../../../api/companyApi.ts";
import { companyRegisterObject, companyRegisterSchema } from "../../../validation/Validation.ts";
import RegisterPage from "../../../components/RegisterPage/RegisterPage.tsx";
import InputField from "../../../components/InputField/InputField";
import Checkbox from "../../../components/Checkbox/Checkbox";
import TextArea from "../../../components/TextArea/TextArea";
import styles from "./CompanyRegisterPage.module.css";

const stepSchemas = [
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
    const initialValues = {
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
    };

    const steps = [
        {

            label: "Fiók adatok",
            render: ({ formData, handleChange, errors }: any) => (
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
                </>
            )
        },
        {
            label: "Cég adatok",
            render: ({ formData, handleChange, errors }: any) => (
                <>
                    <InputField label="Cégnév *" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                    <InputField label="Székhely címe *" name="address" value={formData.address} onChange={handleChange} error={errors.address} />
                    <div className={styles.row}>
                        <InputField label="Adószám *" name="taxNumber" value={formData.taxNumber} onChange={handleChange} error={errors.taxNumber} />
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
                        <InputField label="Kapcsolattartó neve *" name="contactPersonName" value={formData.contactPersonName} onChange={handleChange} error={errors.contactPersonName} />
                        <InputField label="Telefonszám *" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} />
                    </div>
                    <InputField label="Tevékenységi kör *" name="activityScope" value={formData.activityScope} onChange={handleChange} error={errors.activityScope} />
                    <TextArea label="Rövid bemutatkozás *" name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows={3} error={errors.shortDescription} />

                    <div className={`${styles.terms} ${errors.termsAccepted ? styles.errorShake : ""}`}>
                        <Checkbox label="Elfogadom a felhasználási feltételeket" checked={formData.termsAccepted} onChange={(checked) => handleCheckboxChange("termsAccepted", checked)} />
                        {errors.termsAccepted && <span className={styles.errorText}>{errors.termsAccepted}</span>}
                    </div>
                </>
            )
        }
    ];

    const handleCompanyRegister = async (data: any) => {
        await registerCompany({
            email: data.email,
            password: data.password,
            name: data.name,
            address: data.address,
            tax_number: data.taxNumber,
            contact_person_name: data.contactPersonName,
            activity_scope: data.activityScope,
            website: data.website,
            short_description: data.shortDescription,
            phone_number: data.phoneNumber,
            terms_accepted: data.termsAccepted
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
        />
    );
};

export default CompanyRegisterPage;