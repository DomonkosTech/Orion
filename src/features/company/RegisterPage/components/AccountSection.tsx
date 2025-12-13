import React from "react";
import styles from "../CompanyRegisterPage.module.css";
import InputField from "../../../../components/InputField/InputField";
import { type CompanyRegisterForm } from "../validation";

type Props = {
  formData: CompanyRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const AccountSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.section}>
      <h3>Fiók adatok</h3>
      <InputField
        label="Email cím *"
        name="email"
        type="email"
        value={formData.email}
        onChange={onChange}
        required
      />
      <InputField
        label="Jelszó *"
        name="password"
        type="password"
        value={formData.password}
        onChange={onChange}
        required
      />
      <InputField
        label="Jelszó megerősítése *"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default AccountSection;
