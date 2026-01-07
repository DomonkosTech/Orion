import { useState } from "react";
import { sendVerificationEmail } from "../../../services/emailService";
import {toast, Toaster} from "react-hot-toast";

const UserSendVerify = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Kérlek adj meg egy email címet!");
            return;
        }

        setLoading(true);
        try {
            await sendVerificationEmail(email);
            toast.success("Email hitelesítő link elküldve!");
            setEmail("");
        } catch (error){
            console.error(error);
            toast.error("Hiba történt az emmail küldés során!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Toaster/>
            <h2>Email hitelesítés újraküldése</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email címed"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Küldés..." : "Email hitelesítő link küldése"}
                </button>
            </form>
        </div>
    );
};

export default UserSendVerify;