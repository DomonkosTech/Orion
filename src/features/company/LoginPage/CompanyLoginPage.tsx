import React from "react";
import LoginPage from "../../../components/LoginPage/LoginPage.tsx";
import { loginCompany } from "../../../api/companyApi.ts";

const CompanyLoginPage: React.FC = () => {
    return (
        <LoginPage
            title="Cég bejelentkezés"
            onLogin={loginCompany}
            onSuccessRedirect="/company"
            onVerifyRedirect="/company/sendverify"
            registerPath="/CompanyRegisterPage"
            forgotPasswordPath="/company/password/reset"
            switchViewPath="/UserLoginPage"
            switchViewLabel="Váltás felhasználó nézetre"
        />
    );
};

export default CompanyLoginPage;