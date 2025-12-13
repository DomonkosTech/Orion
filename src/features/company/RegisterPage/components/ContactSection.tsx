import React from "react";
import styles from "../CompanyRegisterPage.module.css";
import InputField from "../../../../components/InputField/InputField";
import { type CompanyRegisterForm } from "../validation";

type Props = {
  formData: CompanyRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const ContactSection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.section}>
      <h3>Elérhetőség</h3>
      <InputField
        label="Kapcsolattartó neve *"
        name="contactPersonName"
        value={formData.contactPersonName}
        onChange={onChange}
        required
      />
      <InputField
        label="Telefonszám *"
        name="phoneNumber"
        type="tel"
        value={formData.phoneNumber}
        onChange={onChange}
        required
      />
      <InputField
        label="Lakcím *"
        name="address"
        value={formData.address}
        onChange={onChange}
        required
      />
    </div>
  );
};

export default ContactSection;
