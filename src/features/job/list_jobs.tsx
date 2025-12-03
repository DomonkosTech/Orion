import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Job {
    id: number;
    title: string;
    position: string;
    location: string;
    hourly_wage: number;
    tasks: string;
    requirements: string;
    job_description: string;
}

const ListJobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const navigate = useNavigate();   //

    const handleshowClick = (adId: number) => {
        console.log("Kiválasztott hirdetés ID:", adId);
        navigate(`/job/show/${adId}`);   // működik
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/addadvertisment/getall", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error(`API hiba: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    setJobs(data.advertisement);
                } else {
                    throw new Error(data.error || "Az állások betöltése sikertelen.");
                }
            } catch (err) {
                console.error("Hiba az állások betöltése közben:", err);
                setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div>Betöltés...</div>;
    if (error) return <div>Hiba: {error}</div>;

    return (
        <div>
            <h1>Állások</h1>
            {jobs.length > 0 ? (
                jobs.map((job) => (
                    <div
                        key={job.id}
                        style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}
                        onClick={() => handleshowClick(job.id)}
                    >
                        <h2>{job.title}</h2>
                        <p><strong>Pozíció:</strong> {job.position}</p>
                        <p><strong>Helyszín:</strong> {job.location}</p>
                        <p><strong>Órabér:</strong> {job.hourly_wage} Ft</p>
                    </div>
                ))
            ) : (
                <p>Jelenleg nincsenek elérhető állások.</p>
            )}
        </div>
    );
};

export default ListJobs;
