import React, { useEffect, useState } from "react";

interface User {
    email: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    tax_number: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
}

interface Documents {
    personal_id: string;
    address_card_number: string;
}

const handleLogout = async () => {
    try {
        const res = await fetch("http://localhost:4000/api/logout", {
            method: "POST",
            credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
            alert("Sikeresen kijelentkeztél!");
            window.location.href = "/login"; // átirányítás login oldalra
        }
    } catch (err) {
        console.error("Logout error:", err);
        alert("Hiba történt a kijelentkezés során!");
    }}


const EditUserProfile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [documents, setDocuments] = useState<Documents | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false); // 🆕 szerkesztés állapot




    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/get-user-info", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                    setDocuments(data.documents?.[0] || null);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    if (loading) return <p>Betöltés...</p>;
    if (!user) return <p>Nem található felhasználói adat.</p>;

    // 🆕 Mentés gomb kezelő
    const handleSave = async () => {
        try {
            const payload = {
                ...user,
                documents,
            };

            const res = await fetch("http://localhost:4000/api/update-user-info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setDocuments(data.documents?.[0] || null);
                setEditMode(false);
                alert("Sikeres mentés!");
            } else {
                alert("Mentés sikertelen!");
            }
        } catch (err) {
            console.error("Save error:", err);
            alert("Hiba történt a mentés során!");
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow-md rounded-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center">Profil adatok</h2>

            <form className="grid grid-cols-1 gap-4">
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

                {/* 🆕 Szerkesztés / Mentés gombok */}
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
            <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-md"
            >
                Kijelentkezés
            </button>
        </div>
    );
};

export default EditUserProfile;
