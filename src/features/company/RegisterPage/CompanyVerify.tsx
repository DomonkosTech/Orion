import React from "react";
import VerifyPage from "../../auth/VerifyPage/VerifyPage.tsx";
import { verifyCompanyEmail } from "../../../Api/emailApi.ts";

const CompanyVerify: React.FC = () => {
    return (
        <VerifyPage
            onVerify={verifyCompanyEmail}
            loginPath="/CompanyLoginPage"
            translationNamespace="company"
        />
    );
};

export default CompanyVerify;
