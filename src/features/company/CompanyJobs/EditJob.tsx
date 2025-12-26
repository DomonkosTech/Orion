import {useNavigate, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import {toast, Toaster} from "react-hot-toast";
import {
    getAdvertisementForEdit,
    updateAdvertisement,
    type UpdateAdvertisementData
} from "../../../services/advertisementService";

const EditAdvertisement = () => {
    const { id } = useParams();

    const [advertisement, setAdvertisement] = useState<UpdateAdvertisementData>({
        title: "",
        position: "",
        location: "",
        hourly_wage: "",
        tasks: "",
        requirements: "",
        job_description: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const fetchAdvertisement = async () => {
            if (!id) return;
            try {
                const data = await getAdvertisementForEdit(id);
                if (data.success) {
                    setAdvertisement(data.advertisement);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdvertisement();
    }, [id]);

    if (loading) return <p>Betöltés...</p>;
    // 7. Hibaüzenet átírva
    if (!advertisement || !advertisement.title) return <p>Nem található hirdetés adat.</p>;


    const handleSave = async () => {
        if (!id) return;
        try {
            const data = await updateAdvertisement(id, advertisement);

            if (data.success) {
                setAdvertisement(data.updatedadvertisement || data.advertisement); // Kezeljük mindkét lehetséges választ
                setEditMode(false);
                toast.success("Mentés sikeres!");
                navigate("/company");
            } else {
                toast.error("Mentés sikertelen!");
            }
        } catch (err) {
            console.error("Save error:", err);
            toast.error("Hiba történt a mentés során!");
        }
    };

    return (

        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
            {/* 12. Megjelenített cím átírása */}
            <Toaster />
            <h2 className="text-2xl font-semibold mb-6 text-center">Hirdetés adatok szerkesztése</h2>

            <form className="grid grid-cols-1 gap-4">
                <label>
                    {/* A címkéket a hirdetés mezőinek megfelelően kell átírni */}
                    <span className="block font-medium">Hirdetés címe:</span>
                    <input
                        type="text"
                        value={advertisement.title}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, title: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Pozíció / Munkakör:</span>
                    <input
                        type="text"
                        value={advertisement.position}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, position: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Helyszín:</span>
                    <input
                        type="text"
                        value={advertisement.location}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, location: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Órabér:</span>
                    <input
                        type="text"
                        value={advertisement.hourly_wage}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, hourly_wage: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Részletes leírás:</span>
                    <textarea // Textarea használata, mivel a job_description valószínűleg hosszabb szöveg
                        value={advertisement.job_description}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, job_description: e.target.value })}
                        className="w-full p-2 border rounded-md h-32"
                    />
                </label>

                <label>
                    <span className="block font-medium">Feladatok:</span>
                    <textarea
                        value={advertisement.tasks}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, tasks: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Elvárások:</span>
                    <textarea
                        value={advertisement.requirements}
                        readOnly={!editMode}
                        onChange={(e) => setAdvertisement({ ...advertisement, requirements: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>


                <div className="flex gap-4 mt-4">
                    {!editMode ? (
                        <button
                            type="button"
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md"
                        >
                            Szerkesztés
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-500 text-white rounded-md"
                            >
                                Mentés
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded-md"
                            >
                                Mégse
                            </button>
                        </>
                    )}
                </div>
            </form>
            <br/>

            {/* 13. Visszajelző gomb módosítása */}
            <button onClick={() => navigate("/company")}>
                Vissza a föoldalra
            </button>
        </div>
    );
};

export default EditAdvertisement;