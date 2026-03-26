import React from "react";
import SendVerifyPage from "../../auth/SendVerifyPage/SendVerifyPage.tsx";
import { sendCompanyVerificationEmail } from "../../../Api/emailApi.ts";

const CompanySendVerify: React.FC = () => {
    return (
        <SendVerifyPage
            onSend={sendCompanyVerificationEmail}
            translationNamespace="company"
        />
    );
};

export default CompanySendVerify;
