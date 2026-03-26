import React from "react";
import { saveNewUserPassword } from "../../../Api/emailApi.ts";
import PasswordResetSave from "../../auth/PasswordReset/PasswordResetSave.tsx";

const UserPasswordResetSave: React.FC = () => {
    return (
        <PasswordResetSave
            onSavePassword={saveNewUserPassword}
            redirectPath="/UserLoginPage"
        />
    );
};

export default UserPasswordResetSave;