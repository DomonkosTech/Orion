import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { getCompanyAdvertisements, type CompanyAdvertisement } from "../../../Api/advertisementApi";

const ShowListedJobs: React.FC = () => {
    const navigate = useNavigate();
    const [ads, setAds] = useState<CompanyAdvertisement[]>([]);

    const handleshowClick = (adId: number) => {
        navigate(`/company/ATS/${adId}`);
    };
    // Fogaskerék gomb megnyomásakor
    const handleEditClick = (adId: number) => {
        navigate(`/company/edit/${adId}`);
    };


// Hirdetések lekérése
    useEffect(() => {
        const fetchAds = async () => {
            try {
                const data = await getCompanyAdvertisements();

                if (data.success) {
                    setAds(data.advertisements);
                }
            } catch (err) {
                console.error("Hirdetések lekérése sikertelen:", err);
            }
        };

        fetchAds();
    }, []);


    return (
        <div className="p-6 space-y-4">
            {/* Felső menü */}
            <div className="space-x-3">


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
                        onClick={() => handleshowClick(ad.id)}
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

export default ShowListedJobs;