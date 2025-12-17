import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getUserProfile,
    updateUserProfile,
    deleteResume,
    type UserProfileData,
    type Documents,
} from "../../../services/userServise";

const EditUserProfile: React.FC = () => {
    // State for user profile data, documents, resume status, loading, and edit mode
    const [user, setUser] = useState<UserProfileData | null>(null);
    const [documents, setDocuments] = useState<Documents | null>(null);
    const [resume, setResume] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();

    // Fetch user profile data when the component mounts
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserProfile();
                if (data.success) {
                    setUser(data.user);
                    setDocuments(data.documents?.[0] || null);
                    setResume(data.hasResume);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Handle resume deletion
    const handleDeleteResume = async () => {
        try {
            const data = await deleteResume();
            if (data.success) {
                setResume(false);
                alert("Önéletrajz sikeresen törölve!");
            } else {
                alert(data.error || "Hiba történt a törlés során.");
            }
        } catch (err) {
            console.error("Delete resume error:", err);
            alert("Hiba történt az önéletrajz törlése során.");
        }
    };

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Nem található felhasználói adat.</p>;

    // Handle saving updated user profile data
    const handleSave = async () => {
        if (!user) return;
        try {
            const data = await updateUserProfile({ user, documents });
            if (data.success) {
                alert("Sikeres mentés!");
                window.location.reload(); // Reload to reflect changes
            } else {
                alert("Mentés sikertelen!");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Hiba történt a mentés során!");
        }
    };

    // Display loading message while fetching data
    if (loading) return <p>Betöltés...</p>;
    // Display message if no user data is found
    if (!user) return <p>Nem található felhasználói adat.</p>;

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">Profil adatok</h2>

            <form className="grid grid-cols-1 gap-4">
                <label>
                    <span className="block font-medium">vezetéknév</span>
                    <input
                        type="text"
                        value={user.lname}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, lname: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>
                <label>
                    <span className="block font-medium">keresztnév</span>
                    <input
                        type="text"
                        value={user.fname}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, fname: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>
                <label>
                    <span className="block font-medium">Email:</span>
                    <input
                        type="text"
                        value={user.email}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Telefonszám:</span>
                    <input
                        type="text"
                        value={user.phone_number}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, phone_number: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Születési hely:</span>
                    <input
                        type="text"
                        value={user.birth_place}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, birth_place: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Születési dátum:</span>
                    <input
                        type="date"
                        value={user.birth_date}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, birth_date: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Cím:</span>
                    <input
                        type="text"
                        value={user.address}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, address: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Adószám:</span>
                    <input
                        type="text"
                        value={user.tax_number}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, tax_number: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Állampolgárság:</span>
                    <input
                        type="text"
                        value={user.nationality}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, nationality: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Rövid bemutatkozás:</span>
                    <textarea
                        value={user.short_bio}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, short_bio: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Végzettség(ek):</span>
                    <textarea
                        value={user.qualifications}
                        readOnly={!editMode}
                        onChange={(e) => setUser({ ...user, qualifications: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                {documents && (
                    <>
                        <label>
                            <span className="block font-medium">Személyi igazolvány szám:</span>
                            <input
                                type="text"
                                value={documents.personal_id}
                                readOnly={!editMode}
                                onChange={(e) => setDocuments({ ...documents, personal_id: e.target.value })}
                                className="w-full p-2 border rounded-md"
                            />
                        </label>

                        <label>
                            <span className="block font-medium">Lakcímkártya szám:</span>
                            <input
                                type="text"
                                value={documents.address_card_number}
                                readOnly={!editMode}
                                onChange={(e) =>
                                    setDocuments({ ...documents, address_card_number: e.target.value })
                                }
                                className="w-full p-2 border rounded-md"
                            />
                        </label>
                    </>
                )}

                <div className="mt-6">
                    <h3 className="text-lg font-medium">Önéletrajz</h3>
                    {resume ? (
                        <div>
                            <p>Önéletrajz feltöltve.</p>
                            <button
                                type="button"
                                onClick={handleDeleteResume}
                                className="px-4 py-2 bg-red-500 text-white rounded-md mt-2"
                            >
                                Önéletrajz törlése
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p>Nincs önéletrajz feltöltve.</p>
                            <button
                                type="button"
                                onClick={() => navigate("/uploadresume")}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
                            >
                                Önéletrajz feltöltése
                            </button>
                        </div>
                    )}
                </div>

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
        </div>
    );
};

export default EditUserProfile;
