import { useNavigate} from "react-router-dom";
import React from "react";



const CompanyHomePage: React.FC = () => {


    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/logout", {
                method: "POST",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                alert("Sikeresen kijelentkeztél!");
                navigate("/");
                window.location.reload();
            }
        } catch (err) {
            console.error("Logout error:", err);
            alert("Hiba történt a kijelentkezés során!");
        }
    }

    return(
        <form action="">
            <button onClick={handleLogout}>
                Kijelentkezés
            </button>

            <button onClick={() => navigate("/EditCompanyProfile")}>
                profil szerkesztése
            </button>

            <button onClick={() => navigate("/AddJob")}>
                hirdetés hozzáadása
            </button>



        </form>

    );

};
export default CompanyHomePage;