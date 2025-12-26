import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getJobApplications, type JobApplicationData } from "../../../services/advertisementService";

const JobApplication = () => {
    // State for job applications, current works, loading status, and errors
    const [submits, setSubmits] = useState<JobApplicationData[]>([]);
    const [works, setWorks] = useState<JobApplicationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetches job applications and work data from the service
        const fetchData = async () => {
            try {
                const data = await getJobApplications();
                setSubmits(data.submit || []);
                setWorks(data.work || []);
            } catch (err) {
                // Set error message on failure
                console.error(err);
                setError(err instanceof Error ? err.message : "Hálózati hiba történt");
            } finally {
                // Stop loading indicator
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Show loading message
    if (loading) return <p>Betöltés...</p>;
    // Show error message
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
                            hirdetés: {submit.advertisement?.title}, Status: {submit.status}, Utolsó frissítés: {new Date(submit.last_updated!).toLocaleDateString()}
                        </li>
                    ))}
                </ul>
            )}

            <Link to={"/"}>vissza a föoldalra</Link>
        </div>
    );
};

export default JobApplication;
