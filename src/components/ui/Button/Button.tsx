import React from 'react';
import styles from './Button.module.css';
import { useTranslation } from 'react-i18next';

// Added 'danger' and 'gray' to match the site's action palette
export type ButtonColor = 'orion-blue' | 'fire-red' | 'leaf-green' | 'black' | 'danger' | 'gray';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'link';
    color?: ButtonColor;
    isLoading?: boolean;
    underline?: boolean;
}

const Button: React.FC<ButtonProps> = ({
                                           children,
                                           variant = 'primary',
                                           color = 'black',
                                           isLoading = false,
                                           underline = false,
                                           className,
                                           ...props
                                       }) => {
    const { t } = useTranslation('components');
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
            {isLoading ? t('loading') : children}
        </button>
    );
};

export default Button;