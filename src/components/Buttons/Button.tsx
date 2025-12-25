import React from 'react';
import styles from './Button.module.css';

// Define the allowed color tokens
export type ButtonColor = 'orion-blue' | 'fire-red' | 'leaf-green' | 'black';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'link';
    color?: ButtonColor;
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           color = 'black',
                                           isLoading = false,
                                           className,
                                           ...props
                                       }) => {

    const buttonClass = `${styles.btn} ${styles[variant]} ${className || ''}`;

    return (
        <button
            className={buttonClass}
            data-color={color}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Betöltés..." : children}
        </button>
    );
};

export default Button;