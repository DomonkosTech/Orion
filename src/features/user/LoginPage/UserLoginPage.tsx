import React from "react";
import LoginPage from "../../../components/LoginPage/LoginPage.tsx";
import { loginUser } from "../../../api/userApi.ts";

const UserLoginPage: React.FC = () => {
    return (
        <LoginPage
            title="Felhasználó bejelentkezés"
            onLogin={loginUser}
            onSuccessRedirect="/userhomepage"
            onVerifyRedirect="/user/sendverify"
            registerPath="/UserRegisterPage"
            forgotPasswordPath="/user/password/reset"
            switchViewPath="/CompanyLoginPage"
            switchViewLabel="Váltás céges nézetre"
        />
    );
};

export default UserLoginPage;