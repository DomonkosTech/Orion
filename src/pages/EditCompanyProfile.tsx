import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


interface Company {
    email: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website: string;
    short_description: string;
    phone_number: string;
}


const EditCompanyProfile: React.FC = () => {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
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
                navigate("/CompanyLoginPage");
                window.location.reload();
            }
        } catch (err) {
            console.error("Logout error:", err);
            alert("Hiba történt a kijelentkezés során!");
        }
    }

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/company/getinfo", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setCompany(data.company);
                }
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCompany();
    }, []);

    if (loading) return <p>Betöltés...</p>;
    if (!company) return <p>Nem található cég adat.</p>;

    const handleSave = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/company/updateinfo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(company),
            });

            const data = await res.json();
            if (data.success) {
                setCompany(data.company);
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
            <h2 className="text-2xl font-semibold mb-6 text-center">Cég profil adatok</h2>

            <form className="grid grid-cols-1 gap-4">
                <label>
                    <span className="block font-medium">Email:</span>
                    <input
                        type="email"
                        value={company.email}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, email: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Cég neve:</span>
                    <input
                        type="text"
                        value={company.name}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Telefonszám:</span>
                    <input
                        type="tel"
                        value={company.phone_number}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, phone_number: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Cím:</span>
                    <input
                        type="text"
                        value={company.address}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, address: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Adószám:</span>
                    <input
                        type="text"
                        value={company.tax_number}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, tax_number: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Kapcsolattartó neve:</span>
                    <input
                        type="text"
                        value={company.contact_person_name}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, contact_person_name: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Tevékenységi kör:</span>
                    <input
                        type="text"
                        value={company.activity_scope}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, activity_scope: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Weboldal:</span>
                    <input
                        type="url"
                        value={company.website}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, website: e.target.value })}
                        className="w-full p-2 border rounded-md"
                    />
                </label>

                <label>
                    <span className="block font-medium">Rövid bemutatkozás:</span>
                    <textarea
                        value={company.short_description}
                        readOnly={!editMode}
                        onChange={(e) => setCompany({ ...company, short_description: e.target.value })}
                        className="w-full p-2 border rounded-md"
                        rows={4}
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
            <button
                onClick={handleLogout}>
                Kijelentkezés
            </button>
            <button onClick={() => navigate("/company")}>
                föoldal
            </button>
        </div>
    );
};

export default EditCompanyProfile;
