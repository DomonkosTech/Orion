import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListJobs.module.css";

// Components
import { Header } from "../../../../components/Header/Header.tsx";
import FilterBar from "./components/FilterBar.tsx";
import JobCard from "./components/JobCard.tsx";
import SkeletonCard from "./components/SkeletonCard.tsx";
import EmptyState from "./components/EmptyState.tsx";

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

// Helper for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('hu-HU', {
        style: 'currency',
        currency: 'HUF',
        maximumFractionDigits: 0,
    }).format(amount);
};

// NOTE: skeleton moved to components/SkeletonCard

const ListJobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [locationFilter, setLocationFilter] = useState<string>("");
    const [positionFilter, setPositionFilter] = useState<string>("");
    const [minWage, setMinWage] = useState<string>("");

    const navigate = useNavigate();

    const handleshowClick = (adId: number) => {
        navigate(`/job/show/${adId}`);
    };

    const handleLogout = () => {
        console.log("Logging out...");
        navigate("/login");
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch("http://localhost:4000/api/addadvertisment/getall", {
                    method: "GET",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                });
                if (!response.ok) throw new Error(`API hiba: ${response.status}`);
                const data = await response.json();
                if (data.success) {
                    setJobs(data.advertisement);
                } else {
                    throw new Error(data.error || "Hiba.");
                }
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "Ismeretlen hiba.");
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    // Derived lists
    const uniqueLocations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));
    const uniquePositions = Array.from(new Set(jobs.map(j => j.position).filter(Boolean)));

    const filteredJobs = jobs.filter((job) => {
        const term = searchTerm.trim().toLowerCase();
        const matchesTerm = term
            ? [job.title, job.position, job.location, job.tasks]
                .filter(Boolean)
                .some((f) => String(f).toLowerCase().includes(term))
            : true;

        const matchesLocation = locationFilter ? job.location === locationFilter : true;
        const matchesPosition = positionFilter ? job.position === positionFilter : true;
        const min = parseInt(minWage || "0", 10);
        const matchesWage = min ? job.hourly_wage >= min : true;

        return matchesTerm && matchesLocation && matchesPosition && matchesWage;
    });

    const clearFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setPositionFilter("");
        setMinWage("");
    };

    return (
        <>
            <Header onLogout={handleLogout} />

            <div className={styles.pageWrapper}>

                {/* HERO */}
                <div className={styles.hero}>
                    <h1 className={styles.heroTitle}>Találja meg a jövőjét</h1>
                    <h2 className={styles.heroSubtitle}>
                        Fedezzen fel {jobs.length > 0 ? jobs.length : 'több száz'} nyitott pozíciót vezető cégeknél.
                    </h2>
                </div>

                {/* SEARCH FORM */}
                <div className={styles.searchContainer}>
                    <FilterBar
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        locations={uniqueLocations}
                        locationFilter={locationFilter}
                        onLocationChange={setLocationFilter}
                        positions={uniquePositions}
                        positionFilter={positionFilter}
                        onPositionChange={setPositionFilter}
                        minWage={minWage}
                        onMinWageChange={setMinWage}
                        onClear={clearFilters}
                    />
                </div>

                {/* MAIN CONTENT */}
                <div className={styles.contentContainer}>

                    {/* Error State */}
                    {error && (
                        <div className={styles.emptyState}>
                            <span style={{color: 'red'}}>⚠ Hiba történt: {error}</span>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <div className={styles.gridContainer}>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <SkeletonCard key={n} />
                            ))}
                        </div>
                    )}

                    {/* Results State */}
                    {!loading && !error && (
                        <>
                            {filteredJobs.length > 0 ? (
                                <>
                                    <p className={styles.resultsCount}>
                                        {filteredJobs.length} találat az Ön keresésére
                                    </p>
                                    <div className={styles.gridContainer}>
                                        {filteredJobs.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onOpen={() => handleshowClick(job.id)}
                                                formatCurrency={formatCurrency}
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <EmptyState onClear={clearFilters} />
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ListJobs;