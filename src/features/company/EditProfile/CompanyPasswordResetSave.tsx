import React from "react";
import { saveNewCompanyPassword } from "../../../Api/emailApi.ts";
import PasswordResetSave from "../../auth/PasswordReset/PasswordResetSave.tsx";

const CompanyPasswordResetSave: React.FC = () => {
    return (
        <PasswordResetSave
            onSavePassword={saveNewCompanyPassword}
            redirectPath="/CompanyLoginPage"
        />
    );
};

export default CompanyPasswordResetSave;