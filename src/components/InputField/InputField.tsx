import React, { useState } from 'react';
import styles from './InputField.module.css';
import { Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode; // Supports strings or icons/components
    error?: string;
    containerClassName?: string; // To pass styles.field or styles.fieldFull
    isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
                                                   label,
                                                   error,
                                                   id,
                                                   className,
                                                   containerClassName,
                                                   isPassword,
                                                   type,
                                                   ...props
                                               }) => {
    const { t } = useTranslation('components');
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`${styles.container} ${containerClassName || ''}`}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <div className={styles.inputWrapper}>
                <input
                    id={id}
                    type={inputType}
                    className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''} ${isPassword ? styles.passwordInput : ''}`}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className={styles.eyeButton}
                        onClick={togglePasswordVisibility}
                        tabIndex={-1}
                        aria-label={showPassword ? t('inputField.hidePassword') : t('inputField.showPassword')}
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default InputField;