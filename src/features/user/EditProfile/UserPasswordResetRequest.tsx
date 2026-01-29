import React from "react";
import { sendUserPasswordResetEmail } from "../../../api/emailApi.ts";
import PasswordResetRequest from "../../../components/PasswordReset/PasswordResetRequest.tsx";

const UserPasswordResetRequest: React.FC = () => {
    return (
        <PasswordResetRequest
            onSendEmail={sendUserPasswordResetEmail}
            title="Jelszó csere"
            description="Kérjük, adja meg az email címét a jelszó cserélő link küldéséhez."
            successMessage="jelszó cserélő link elküldve az email címére!"
        />
    );
};

export default UserPasswordResetRequest;
