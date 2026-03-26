import React from "react";
import VerifyPage from "../../auth/VerifyPage/VerifyPage.tsx";
import { verifyUserEmail } from "../../../Api/emailApi.ts";

const UserVerify: React.FC = () => {
    return (
        <VerifyPage
            onVerify={verifyUserEmail}
            loginPath="/UserLoginPage"
            translationNamespace="user"
        />
    );
};

export default UserVerify;