import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListJobs.module.css";

// Components
import { Header } from "../../../../components/Header/Header.tsx";
import FilterBar from "./components/FilterBar.tsx";
import JobCard from "./components/JobCard.tsx";
import SkeletonCard from "./components/SkeletonCard.tsx";
import EmptyState from "./components/EmptyState.tsx";
import { getAdvertisements, type Job } from "../../../../services/advertisementService.ts";
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

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getAdvertisements();
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
        fetchJobs();
    }, []);

    // Derived lists
    const uniqueLocations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)));
    const uniquePositions = Array.from(new Set(jobs.map((j) => j.position).filter(Boolean)));

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
            <Header />

            <div className={styles.pageWrapper}>
                {/* HERO / BANNER */}
                <section className={styles.banner}>
                    <div className={styles.bannerInner}>
                        <BannerKicker>Álláskeresés</BannerKicker>

                        <h1 className={styles.bannerTitle}>Találja meg a jövőjét</h1>

                        <p className={styles.bannerSubtitle}>
                            Fedezzen fel{" "}
                            <strong>{jobs.length > 0 ? jobs.length : "több száz"}</strong> nyitott pozíciót
                            vezető cégeknél — gyors szűrés, letisztult felület.
                        </p>

                        <div className={styles.bannerStats}>
                            <div className={styles.stat}>
                                <div className={styles.statLabel}>Elérhető hirdetések</div>
                                <div className={styles.statValue}>{jobs.length || "—"}</div>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <div className={styles.statLabel}>Találatok</div>
                                <div className={styles.statValue}>
                                    {loading ? "…" : error ? "—" : filteredJobs.length}
                                </div>
                            </div>
                            <div className={styles.statDivider} />
                            <div className={styles.stat}>
                                <div className={styles.statLabel}>Tipp</div>
                                <div className={styles.statValueSm}>Használjon pozíció kulcsszót</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SEARCH PANEL */}
                <section className={styles.searchSection}>
                    <div className={styles.searchShell}>
                        <div className={styles.searchHeader}>
                            <div>
                                <h2 className={styles.searchTitle}>Keresés és szűrés</h2>
                                <p className={styles.searchHint}>Válasszon helyszínt, pozíciót és minimálbért.</p>
                            </div>

                            <div className={styles.searchChip}>
                                <span className={styles.searchChipDot} />
                                Élő szűrés
                            </div>
                        </div>

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
                </section>

                {/* MAIN CONTENT */}
                <main className={styles.contentContainer}>
                    {/* Error State */}
                    {error && (
                        <div className={styles.emptyState}>
                            <span className={styles.emptyStateIcon}>⚠</span>
                            <h3>Hiba történt</h3>
                            <p className={styles.muted}>Nem sikerült betölteni az állásokat: {error}</p>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <>
                            <div className={styles.resultsHeader}>
                                <div className={styles.resultsTitle}>Betöltés…</div>
                                <div className={styles.resultsMeta}>Kérjük várjon</div>
                            </div>

                            <div className={styles.gridContainer}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                    <SkeletonCard key={n} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Results State */}
                    {!loading && !error && (
                        <>
                            {filteredJobs.length > 0 ? (
                                <>
                                    <div className={styles.resultsHeader}>
                                        <div>
                                            <div className={styles.resultsTitle}>Találatok</div>
                                            <div className={styles.resultsMeta}>
                                                {filteredJobs.length} találat az Ön keresésére
                                            </div>
                                        </div>

                                        <div className={styles.resultsPill}>
                                            Szűrés aktív:{" "}
                                            {(searchTerm || locationFilter || positionFilter || minWage)
                                                ? "igen"
                                                : "nem"}
                                        </div>
                                    </div>

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
                </main>
                <Footer></Footer>
            </div>
        </>
    );
};

export default ListJobs;