import React, { useEffect, useRef } from "react";
import { DesktopFilterBar } from "./DesktopFilterBar.tsx";
import { MobileFilterBar } from "./MobileFilterBar.tsx";
import { useIsMobile } from "../../../../../hooks/useIsMobile.ts";
import { useDebounce } from "../../../../../hooks/useDebounce.ts";

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
    isAISearchActive: boolean;
    onToggleAISearch: () => void;
};

const FilterBar: React.FC<Props> = (props) => {
    const isMobile = useIsMobile();
    const isFirstRender = useRef(true);

    // Debounce all filter inputs
    const debouncedSearchTerm = useDebounce(props.searchTerm, 500);
    const debouncedLocation = useDebounce(props.locationFilter, 500);
    const debouncedPosition = useDebounce(props.positionFilter, 500);
    const debouncedMinWage = useDebounce(props.minWage, 500);

    // Trigger search when any debounced filter changes (normal mode only — AI mode uses explicit submit)
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (!props.isAISearchActive) {
            props.onSubmit(undefined as unknown as React.FormEvent);
        }
    }, [debouncedSearchTerm, debouncedLocation, debouncedPosition, debouncedMinWage, props.isAISearchActive]);

    const hasActiveFilters = Boolean(
        props.searchTerm ||
        props.locationFilter ||
        props.positionFilter ||
        props.minWage
    );

    const suggestions = [
        "Java fejlesztő munkát keresek",
        "adminisztrátor munkát keresek",
        "Hostes munkát keresek",
        "raktáros munka"
    ];

    if (isMobile) {
        return (
            <MobileFilterBar
                {...props}
                hasActiveFilters={hasActiveFilters}
                suggestions={suggestions}
            />
        );
    }

    return (
        <DesktopFilterBar
            {...props}
            hasActiveFilters={hasActiveFilters}
            suggestions={suggestions}
        />
    );
};

export default FilterBar;

