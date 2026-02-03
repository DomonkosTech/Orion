import React from "react";
import { useTranslation } from "react-i18next";
import { sendCompanyPasswordResetEmail } from "../../../api/emailApi.ts";
import PasswordResetRequest from "../../../components/PasswordReset/PasswordResetRequest.tsx";

const CompanyPasswordResetRequest: React.FC = () => {
    const { t } = useTranslation('company');

    return (
        <PasswordResetRequest
            onSendEmail={sendCompanyPasswordResetEmail}
            title={t('passwordReset.title')}
            description={t('passwordReset.description')}
            successMessage={t('passwordReset.success')}
        />
    );
};

export default CompanyPasswordResetRequest;
