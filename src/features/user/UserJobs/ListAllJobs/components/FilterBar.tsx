import React from "react";
import { DesktopFilterBar } from "./DesktopFilterBar.tsx";
import { MobileFilterBar } from "./MobileFilterBar.tsx";
import { useIsMobile } from "../../../../../hooks/useIsMobile.ts";

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
    
    const hasActiveFilters = Boolean(
        props.searchTerm || 
        props.locationFilter || 
        props.positionFilter || 
        props.minWage
    );

    const suggestions = [
        "Java fejlesztő Budapesten 600e felett",
        "Részmunkaidős adminisztráció",
        "Diákmunka amihez nem kell tapasztalat",
        "Szakács állás Balaton környékén"
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

