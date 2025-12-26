import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// TypeScript interfaces based on the API response
interface ApplicantUser {
    email: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
    lname: string;
    fname: string;
}

interface Applicant {
    id: number;
    last_updated: string;
    users: ApplicantUser;
}

export const ApplicantTrackingSystem: React.FC = () => {
    const [applicants, setApplicants] = useState<Applicant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>(); // Get advertisement ID from URL

    useEffect(() => {
        const fetchApplicants = async () => {
            if (!id) {
                setLoading(false);
                setError("Nincs hirdetés azonosító megadva.");
                return;
            }

            try {
                const res = await fetch(`http://localhost:4000/api/advertisements/${id}/applicants`, {
                    method: "get",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                const data = await res.json();

                if (data.success) {
                    setApplicants(data.applicants);
                } else {
                    setError(data.error || "Hiba a jelentkezők lekérésekor.");
                }
            } catch (err) {
                setError("Hálózati hiba vagy a szerver nem elérhető.");
                console.error("Fetch applicants error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplicants();
    }, [id]);

    const handleAccept = async (applicationId: number) => {
        try {
            const res = await fetch(`http://localhost:4000/api/applications/${applicationId}/accept`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });

            const data = await res.json();

            if (data.success) {
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
            } else {
                alert(`Hiba a jelentkező elfogadásakor: ${data.error}`);
            }
        } catch (err) {
            alert("Hálózati hiba vagy a szerver nem elérhető.");
            console.error("Accept application error:", err);
        }
    };

    const handleDownloadResume = async (applicationId: number) => {
        try {
            const res = await fetch("http://localhost:4000/api/ATS/download_resume", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ id: applicationId }),
            });

            const data = await res.json();

            if (data.success) {
                window.open(data.url, '_blank');
            } else {
                alert(data.message || data.error || "Hiba az önéletrajz letöltésekor.");
            }
        } catch (err) {
            alert("Hálózati hiba vagy a szerver nem elérhető.");
            console.error("Download resume error:", err);
        }
    };

    const handleReject = async (applicationId: number) => {
        try {
            const res = await fetch("http://localhost:4000/api/ATS/reject_application", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ id: applicationId }),
            });

            const data = await res.json();

            if (data.success) {
                setApplicants(prev => prev.filter(app => app.id !== applicationId));
            } else {
                alert(`Hiba a jelentkező elutasításakor: ${data.error}`);
            }
        } catch (err) {
            alert("Hálózati hiba vagy a szerver nem elérhető.");
            console.error("Reject application error:", err);
        }
    };

    if (loading) {
        return <p className="text-center mt-8">Jelentkezők betöltése...</p>;
    }

    if (error) {
        return <p className="text-center mt-8 text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Jelentkezőkezelő Rendszer</h1>
            {applicants.length === 0 ? (
                <p>Nincsenek új jelentkezők ehhez a hirdetéshez.</p>
            ) : (
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <table className="min-w-full bg-white">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vezetéknév</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keresztnév</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Születési Dátum</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Születési Hely</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jelentkezés Dátuma</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Műveletek</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {applicants.map((applicant) => (
                                <tr key={applicant.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">{applicant.users.lname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{applicant.users.fname}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{applicant.users.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(applicant.users.birth_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{applicant.users.birth_place}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{new Date(applicant.last_updated).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDownloadResume(applicant.id)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                                        >
                                            Önéletrajz
                                        </button>
                                        <button
                                            onClick={() => handleAccept(applicant.id)}
                                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                                        >
                                            Felvesz
                                        </button>
                                        <button
                                            onClick={() => handleReject(applicant.id)}
                                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                        >
                                            Elutasít
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicantTrackingSystem;
