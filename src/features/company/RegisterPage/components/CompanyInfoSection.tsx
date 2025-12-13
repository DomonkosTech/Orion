import React from "react";
import styles from "../CompanyRegisterPage.module.css";
import InputField from "../../../../components/InputField/InputField";
import { type CompanyRegisterForm } from "../validation";

type Props = {
  formData: CompanyRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const CompanyInfoSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.section}>
      <h3>Cégadatok</h3>
      <InputField
        label="Cég neve *"
        name="name"
        value={formData.name}
        onChange={onChange}
        required
      />
      <InputField
        label="Adószám *"
        name="taxNumber"
        value={formData.taxNumber}
        onChange={onChange}
        required
      />
      <InputField
        label="Weboldal"
        name="website"
        value={formData.website ?? ""}
        onChange={onChange}
      />
    </div>
  );
};

export default CompanyInfoSection;
