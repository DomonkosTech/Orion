import React from "react";
import SendVerifyPage from "../../auth/SendVerifyPage/SendVerifyPage.tsx";
import { sendUserVerificationEmail } from "../../../Api/emailApi.ts";

const UserSendVerify: React.FC = () => {
    return (
        <SendVerifyPage
            onSend={sendUserVerificationEmail}
            translationNamespace="user"
        />
    );
};

export default UserSendVerify;
