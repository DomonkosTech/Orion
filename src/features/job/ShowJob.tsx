import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

interface Advertisement {
    title: string;
    position: string;
    location: string;
    hourly_wage: string;
    tasks: string;
    requirements: string;
    job_description: string;
    is_active: boolean;
}

const ShowJob = () => {
    const { id } = useParams();
    const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAdvertisement = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/addadvertisment/user/getinfo", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ id }),
                });
                const data = await res.json();
                if (data.success) {
                    setAdvertisement(data.advertisement);
                } else {
                    setError(data.error || "Az állás betöltése sikertelen.");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError("Hiba történt az állás betöltése során.");
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisement();
    }, [id]);

    if (loading) {
        return <p>Betöltés...</p>;
    }

    if (error) {
        return <p>Hiba: {error}</p>;
    }

    if (!advertisement) {
        return <p>Nem található hirdetés.</p>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">Állás részletei</h2>

            <div className="space-y-4">
                <div>
                    <span className="block font-medium">Hirdetés címe:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50">{advertisement.title}</p>
                </div>

                <div>
                    <span className="block font-medium">Pozíció / Munkakör:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50">{advertisement.position}</p>
                </div>

                <div>
                    <span className="block font-medium">Helyszín:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50">{advertisement.location}</p>
                </div>

                <div>
                    <span className="block font-medium">Órabér:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50">{advertisement.hourly_wage} Ft</p>
                </div>

                <div>
                    <span className="block font-medium">Részletes leírás:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50 whitespace-pre-wrap">{advertisement.job_description}</p>
                </div>

                <div>
                    <span className="block font-medium">Feladatok:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50 whitespace-pre-wrap">{advertisement.tasks}</p>
                </div>

                <div>
                    <span className="block font-medium">Elvárások:</span>
                    <p className="w-full p-2 border rounded-md bg-gray-50 whitespace-pre-wrap">{advertisement.requirements}</p>
                </div>
            </div>

            <div className="mt-6 text-center">
                <button
                    type="button"
                    onClick={() => navigate("/listjobs")}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Vissza az állások listájához
                </button>
            </div>
        </div>
    );
};

export default ShowJob;
