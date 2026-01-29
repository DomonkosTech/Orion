import React from "react";
import { saveNewCompanyPassword } from "../../../api/emailApi.ts";
import PasswordResetSave from "../../../components/PasswordReset/PasswordResetSave.tsx";

const CompanyPasswordResetSave: React.FC = () => {
    return (
        <PasswordResetSave
            onSavePassword={saveNewCompanyPassword}
            redirectPath="/CompanyLoginPage"
        />
    );
};

export default CompanyPasswordResetSave;