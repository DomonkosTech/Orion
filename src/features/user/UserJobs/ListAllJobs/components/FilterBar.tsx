import React from "react";
import { Search, MapPin, Briefcase, Coins, X } from "lucide-react";
import styles from "../ListJobs.module.css";
import InputField from "../../../../../components/InputField/InputField.tsx";
import Button from "../../../../../components/Button/Button.tsx";

type Props = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    locations: string[];
    locationFilter: string;
    onLocationChange: (value: string) => void;
    positions: string[];
    positionFilter: string;
    onPositionChange: (value: string) => void;
    minWage: string;
    onMinWageChange: (value: string) => void;
    onClear: () => void;
    onSubmit: (e: React.FormEvent) => void;
};

const FilterBar: React.FC<Props> = ({
    searchTerm,
    onSearchChange,
    locations,
    locationFilter,
    onLocationChange,
    positions,
    positionFilter,
    onPositionChange,
    minWage,
    onMinWageChange,
    onClear,
    onSubmit,
}) => {
    const hasActiveFilters = Boolean(searchTerm || locationFilter || positionFilter || minWage);

    return (
        <form className={styles.searchForm} onSubmit={onSubmit}>
            <div className={styles.searchBarWrapper}>
                <Search size={20} className={styles.inputIcon} />
                <InputField
                    type="text"
                    placeholder="Milyen munkát keres? (pl. Java fejlesztő, Könyvelő)"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.filterGroup}>
                    <MapPin size={18} className={styles.inputIcon} />
                    <select
                        className={styles.filterControl}
                        value={locationFilter}
                        onChange={(e) => onLocationChange(e.target.value)}
                    >
                        <option value="">Helyszín (Összes)</option>
                        {locations.map((loc) => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <Briefcase size={18} className={styles.inputIcon} />
                    <select
                        className={styles.filterControl}
                        value={positionFilter}
                        onChange={(e) => onPositionChange(e.target.value)}
                    >
                        <option value="">Pozíció (Összes)</option>
                        {positions.map((pos) => (
                            <option key={pos} value={pos}>{pos}</option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <Coins size={18} className={styles.inputIcon} />
                    <input
                        type="number"
                        min={0}
                        className={styles.filterControl}
                        value={minWage}
                        onChange={(e) => onMinWageChange(e.target.value)}
                        placeholder="Min. Bér"
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="submit" color={"orion-blue"} className={styles.searchButton}>
                        Keresés
                    </Button>

                    {hasActiveFilters && (
                        <button
                            type="button" 
                            onClick={onClear}
                            className={styles.clearButton}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default FilterBar;
