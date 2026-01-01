import React from "react";
import styles from "../ListJobs.module.css";
import Button from "../../../../../components/Button/Button.tsx";

type Props = {
    onClear: () => void;
};

const EmptyState: React.FC<Props> = ({ onClear }) => {
    return (
        <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>🔍</span>
            <h3>Nincs találat.</h3>
            <p style={{ color: '#6b7280' }}>
                Próbálja meg módosítani a szűrőket vagy a keresési feltételeket.
            </p>

            <div style={{ marginTop: '20px', display: 'inline-block' }}>
                <Button type="button" variant="primary" onClick={onClear}>
                    Szűrők törlése
                </Button>
            </div>
        </div>
    );
};

export default EmptyState;
