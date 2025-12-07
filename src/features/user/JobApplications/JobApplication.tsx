import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


interface company {
    name?: string;
}
interface advertisment {
    title?: string;
}

interface JobApplicationData {
    id: number;
    user_id: number;
    advertisement_id?: number;
    status?: string;
    last_updated?: string;
    company_id?: number;
    position?: string;
    job_title?: string;
    hourly_wage?: number;
    hire_date?: string;
    company?: company;
    advertisment?: advertisment;
}

const JobApplication = () => {
    const [submits, setSubmits] = useState<JobApplicationData[]>([]);
    const [works, setWorks] = useState<JobApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("http://localhost:4000/api/addadvertisment/getallsubmit", {
                    method: "POST",
                    credentials: "include", // hogy a cookie átmenjen
                });
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || "Hiba történt az adatlekéréskor");
                } else {
                    setSubmits(data.submit || []);
                    setWorks(data.work || []);
                }
            } catch (err) {
                console.error(err);
                setError("Hálózati hiba történt");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <p>Betöltés...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (

        <div>
            <h1>Munkáim / Jelentkezéseim</h1>

            <h2>Munkáim</h2>

            {works.length === 0 ? (
                <p>Nincs munkád.</p>
            ) : (
                <ul>
                    {works.map((work) => (
                        <li key={work.id}>
                            cím:{work.job_title} - pozíció: {work.position} , cég: {work.company?.name} , Órabér: {work.hourly_wage}, Belépés: {new Date(work.hire_date!).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Jelentkezéseim</h2>
            {submits.length === 0 ? (
                <p>Nincs jelentkezésed.</p>
            ) : (
                <ul>
                    {submits.map((submit) => (
                        <li key={submit.id}>
                            hirdetés: {submit.advertisment?.title}, Status: {submit.status}, Utolsó frissítés: {new Date(submit.last_updated!).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}

            <Link to={"/"}>vissza a föoldalra</Link>
        </div>
    );
};

export default JobApplication;
