import React from 'react';
import styles from './Button.module.css';

export type ButtonColor = 'orion-blue' | 'fire-red' | 'leaf-green' | 'black';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'link';
    color?: ButtonColor;
    isLoading?: boolean;
    underline?: boolean; // Add this line
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           color = 'black',
                                           isLoading = false,
                                           underline = false, // Default to false
                                           className,
                                           ...props
                                       }) => {
    // Add the underline class conditionally
    const buttonClass = [
        styles.btn,
        styles[variant],
        underline ? styles.underlined : '',
        className || ''
    ].join(' ').trim();

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