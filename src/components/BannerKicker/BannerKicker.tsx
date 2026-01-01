import styles from "./BannerKicker.module.css";

interface BannerKickerProps {
    children: React.ReactNode;
}

const BannerKicker = ({ children }: BannerKickerProps) => {
    return (
        <div className={styles.bannerKicker}>
            Orion • {children}
        </div>
    );
};

export default BannerKicker;