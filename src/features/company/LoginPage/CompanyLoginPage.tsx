import React from "react";
import { useTranslation } from "react-i18next";
import LoginPage from "../../../components/LoginPage/LoginPage.tsx";
import { loginCompany } from "../../../Api/companyApi.ts";

const CompanyLoginPage: React.FC = () => {
    const { t } = useTranslation('company');

    return (
        <LoginPage
            title={t('login.title')}
            onLogin={loginCompany}
            onSuccessRedirect="/company"
            onVerifyRedirect="/company/sendverify"
            registerPath="/CompanyRegisterPage"
            forgotPasswordPath="/company/password/reset"
            switchViewPath="/UserLoginPage"
            switchViewLabel={t('login.switchView')}
        />
    );
};

export default CompanyLoginPage;