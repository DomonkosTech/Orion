import React from "react";
import styles from "../CompanyRegisterPage.module.css";
import InputField from "../../../../components/InputField/InputField";
import TextArea from "../../../../components/TextArea/TextArea";
import { type CompanyRegisterForm } from "../validation";

type Props = {
  formData: CompanyRegisterForm;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const ActivitySection: React.FC<Props> = ({ formData, onChange }) => {
  return (
    <div className={styles.section}>
      <h3>Tevékenység</h3>
      <InputField
        label="Tevékenységi kör *"
        name="activityScope"
        value={formData.activityScope}
        onChange={onChange}
        required
      />
      <TextArea
        label="Rövid bemutatkozás *"
        name="shortDescription"
        value={formData.shortDescription}
        onChange={onChange}
        rows={4}
        required
        maxLength = {250}
      />
    </div>
  );
};

export default ActivitySection;
