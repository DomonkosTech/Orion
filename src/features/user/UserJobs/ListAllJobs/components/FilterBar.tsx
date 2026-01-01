import React from "react";
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
}) => {
    const hasActiveFilters = Boolean(searchTerm || locationFilter || positionFilter || minWage);

    return (
        <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
            <InputField
                label="Keresés"
                type="text"
                placeholder="Milyen munkát keres? (pl. Java fejlesztő, Könyvelő)"
                className={styles.searchInput}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />

            <div className={styles.filtersBar}>
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

                <InputField
                    type="number"
                    min={0}
                    className={styles.filterControl}
                    value={minWage}
                    onChange={(e) => onMinWageChange(e.target.value)}
                    placeholder="Min. Bér"
                />

                <div className={styles.actions}>
                    <Button type="submit" color={"orion-blue"}>
                        Keresés
                    </Button>

                    {hasActiveFilters && (
                        <Button type="button" variant="link" onClick={onClear}>
                            ✕
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
};

export default FilterBar;
