import React from "react";
import { Search, MapPin, Briefcase, Coins, X } from "lucide-react";
import styles from "../ListJobs.module.css";
import InputField from "../../../../../components/InputField/InputField.tsx";
import Button from "../../../../../components/Button/Button.tsx";

type Props = {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    locationFilter: string;
    onLocationChange: (value: string) => void;
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
    locationFilter,
    onLocationChange,
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
                    <InputField
                        type="text"
                        placeholder="Helyszín"
                        value={locationFilter}
                        onChange={(e) => onLocationChange(e.target.value)}
                        className={styles.filterControl}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <Briefcase size={18} className={styles.inputIcon} />
                    <InputField
                        type="text"
                        placeholder="Pozíció"
                        value={positionFilter}
                        onChange={(e) => onPositionChange(e.target.value)}
                        className={styles.filterControl}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <Coins size={18} className={styles.inputIcon} />
                    <InputField
                        type="number"
                        min={0}
                        placeholder="Min. Bér"
                        value={minWage}
                        onChange={(e) => onMinWageChange(e.target.value)}
                        className={styles.filterControl}
                    />
                </div>

                <div className={styles.actions}>
                    <Button type="submit" color={"orion-blue"} className={styles.searchButton}>
                        Keresés
                    </Button>

                    <button
                        type="button"
                        onClick={onClear}
                        className={styles.clearButton}
                        disabled={!hasActiveFilters}
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default FilterBar;
