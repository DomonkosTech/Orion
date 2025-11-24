import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

// Hirdetés típus definiálása
type Advertisement = {
    id: number;
    title: string;
    location: string;
    position: string;
};

const CompanyHomePage: React.FC = () => {
    const navigate = useNavigate();

// Hirdetések tárolása típusosan
    const [ads, setAds] = useState<Advertisement[]>([]);

// Hirdetések lekérése
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/advertisements/by-company", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await res.json();

                if (data.success) {
                    setAds(data.advertisements);
                }
            } catch (err) {
                console.error("Hirdetések lekérése sikertelen:", err);
            }
        };

        fetchAds();
    }, []);

// Fogaskerék gomb megnyomásakor
    const handleEditClick = (adId: number) => {
        console.log("Kiválasztott hirdetés ID:", adId);
        navigate(`/company/edit/${adId}`);

    };

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
    };

    return (
        <div className="p-6 space-y-4">
            {/* Felső menü */}
            <div className="space-x-3">
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl"
                >
                    Kijelentkezés
                </button>

                <button
                    onClick={() => navigate("/EditCompanyProfile")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl"
                >
                    Profil szerkesztése
                </button>

                <button
                    onClick={() => navigate("/AddJob")}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl"
                >
                    Hirdetés hozzáadása
                </button>
            </div>
            <br/>
            <br/>
            {/* Hirdetés listázása */}
            <div>
                {ads.map((ad) => (
                    <div
                        key={ad.id}
                        className="p-4 border rounded-2xl shadow-md flex justify-between items-center bg-white"
                    >
                        <div style={{ display: "flex", flexDirection: "column", padding: "10px", borderRadius: "8px", border: "1px solid #ddd"}}>
                        <div >
                            <h2 className="text-xl font-semibold">{ad.title}</h2>
                            <p className="text-gray-600">{ad.position}</p>
                        </div>

                        <button
                            onClick={() => handleEditClick(ad.id)}
                        >
                            <span className="text-xl">⚙️</span>
                        </button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanyHomePage;