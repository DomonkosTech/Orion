import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { verifyEmail } from "../../../services/emailService";
import {toast, Toaster} from "react-hot-toast";

const UserVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isVerifying = useRef(false);

    useEffect(() => {
        const token = searchParams.get("token");

        if (token && !isVerifying.current) {
            isVerifying.current = true;
            
            verifyEmail(token)
                .then(() => {
                    toast.success("Sikeres e-mail igazolás!");
                    navigate("/UserLoginPage"); // Vagy ahova irányítani szeretnéd
                })
                .catch((error) => {
                    toast.error("Hiba történt: " + error.message);
                });
        }
    }, [searchParams, navigate]);

    return (

        <div>
            <Toaster/>
            <p>E-mail ellenőrzése folyamatban...</p>
        </div>
    );
};

export default UserVerify;