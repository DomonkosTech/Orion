import React from "react";
import { sendCompanyPasswordResetEmail } from "../../../api/emailApi.ts";
import PasswordResetRequest from "../../../components/PasswordReset/PasswordResetRequest.tsx";

const CompanyPasswordResetRequest: React.FC = () => {
    return (
        <PasswordResetRequest
            onSendEmail={sendCompanyPasswordResetEmail}
            title="Új jelszó igénylés"
            description="Kérjük, adja meg az email címét a jelszó csere link újraküldéséhez."
            successMessage="link elküldve az email címére!"
        />
    );
};

export default CompanyPasswordResetRequest;
