import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompanyProfile, updateCompanyProfile, type CompanyProfile } from "../../../Api/companyApi.ts";
import { toast, Toaster } from "react-hot-toast";
import { companyUpdateProfileSchema } from "../../../validation/validation";

const EditCompanyProfile: React.FC = () => {
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const navigate = useNavigate();




    useEffect(() => {
        const fetchCompany = async () => {
            try {
                const data = await getCompanyProfile();
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
        if (!company) return;

        // Zod validáció futtatása a mentés előtt
        const validation = companyUpdateProfileSchema.safeParse(company);
        if (!validation.success) {
            toast.error(validation.error.errors[0].message);
            return;
        }

        try {
            const data = await updateCompanyProfile(company);
            if (data.success) {
                setCompany(data.company);
                setEditMode(false);
                toast.success("Sikeres mentés!");
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
            <h2 className="text-2xl font-semibold mb-6 text-center">Cég profil adatok</h2>
            <Toaster></Toaster>
            <form className="grid grid-cols-1 gap-4">


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

            <button onClick={() => navigate("/company")}>
                föoldal
            </button>
        </div>
    );
};

export default EditCompanyProfile;
