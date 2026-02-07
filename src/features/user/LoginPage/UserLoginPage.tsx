import React from "react";
import { useTranslation } from "react-i18next";
import LoginPage from "../../../components/LoginPage/LoginPage.tsx";
import { loginUser } from "../../../Api/userApi.ts";

const UserLoginPage: React.FC = () => {
    const { t } = useTranslation('user');
    return (
        <LoginPage
            title={t('login.title')}
            onLogin={loginUser}
            onSuccessRedirect="/userhomepage"
            onVerifyRedirect="/user/sendverify"
            registerPath="/UserRegisterPage"
            forgotPasswordPath="/user/password/reset"
            switchViewPath="/CompanyLoginPage"
            switchViewLabel={t('login.switchViewLabel')}
        />
    );
};

export default UserLoginPage;