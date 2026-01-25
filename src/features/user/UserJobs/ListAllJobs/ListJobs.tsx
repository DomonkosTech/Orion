import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListJobs.module.css";

// Components
import { Header } from "../../../../components/Header/Header.tsx";
import FilterBar from "./components/FilterBar.tsx";
import JobCard from "./components/JobCard.tsx";
import SkeletonCard from "./components/SkeletonCard.tsx";
import EmptyState from "./components/EmptyState.tsx";
import { getAdvertisements, getAdvertisements2, type Job } from "../../../../api/advertisementApi.ts";
import BannerKicker from "../../../../components/BannerKicker/BannerKicker.tsx";
import Footer from "../../../../components/Footer/Footer.tsx";


// Helper for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("hu-HU", {
        style: "currency",
        currency: "HUF",
        maximumFractionDigits: 0,
    }).format(amount);
};

const ListJobs: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [allJobsForFilters, setAllJobsForFilters] = useState<Job[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [locationFilter, setLocationFilter] = useState<string>("");
    const [positionFilter, setPositionFilter] = useState<string>("");
    const [minWage, setMinWage] = useState<string>("");

    const navigate = useNavigate();

    // Navigation handlers
    const handleshowClick = (adId: number) => {
        navigate(`/job/show/${adId}`);
    };

    const fetchJobs = async (
        q: string = "",
        loc: string = "",
        pos: string = "",
        wage: string = ""
    ) => {
        setLoading(true);
        try {
            const data = await getAdvertisements2(q, loc, pos, wage);
            if (data.success) {
                setJobs(data.advertisements);
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

    const fetchFilterOptions = async () => {
        try {
            const data = await getAdvertisements();
            if (data.success) {
                setAllJobsForFilters(data.advertisements);
            }
        } catch (err) {
            console.error("Failed to fetch filter options:", err);
        }
    };

    useEffect(() => {
        fetchFilterOptions();
        fetchJobs();
    }, []);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        fetchJobs(searchTerm, locationFilter, positionFilter, minWage);
    };

    // Derived lists from all jobs to keep filter options stable
    const uniqueLocations = Array.from(new Set(allJobsForFilters.map((j) => j.location).filter(Boolean)));
    const uniquePositions = Array.from(new Set(allJobsForFilters.map((j) => j.position).filter(Boolean)));

    const clearFilters = () => {
        setSearchTerm("");
        setLocationFilter("");
        setPositionFilter("");
        setMinWage("");
        fetchJobs("", "", "", "");
    };

    return (
        <div className={styles.pageWrapper}>
            <Header />

            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {/* Dashboard Style Header */}
                    <div className={styles.dashboardHeader}>
                        <div className={styles.welcomeSection}>
                            <div className={styles.kickerWrapper}>
                                <BannerKicker>Álláskeresés</BannerKicker>
                            </div>
                            <h1 className={styles.heroTitle}>
                                Találja meg a <span className={styles.accent}>jövőjét!</span>
                            </h1>
                            <p className={styles.heroSubtitle}>
                                Fedezzen fel <strong>{jobs.length > 0 ? jobs.length : "több száz"}</strong> nyitott pozíciót vezető cégeknél.
                            </p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className={styles.searchForm}>
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
                            onSubmit={handleSearch}
                        />
                    </div>

                    {/* Jobs Grid */}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Hiba történt</h3>
                            <p style={{ color: 'var(--muted)' }}>{error}</p>
                        </div>
                    )}

                    {loading && (
                        <div className={styles.grid}>
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <SkeletonCard key={n} />
                            ))}
                        </div>
                    )}

                    {!loading && !error && (
                        <>
                            {jobs.length > 0 ? (
                                <div className={styles.grid}>
                                    {jobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            onOpen={() => handleshowClick(job.id)}
                                            formatCurrency={formatCurrency}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState onClear={clearFilters} />
                            )}
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ListJobs;