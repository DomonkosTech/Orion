import React from 'react';
// Assuming the file is named Button.module.css in reality, though your screenshot said .tsx.css
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'link';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           isLoading = false,
                                           className,
                                           ...props
                                       }) => {
    // Combine base class with variant class
    const buttonClass = `${styles.btn} ${styles[variant]} ${className || ''}`;

    return (
        <button className={buttonClass} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? "Betöltés..." : children}
        </button>
    );
};

export default Button;