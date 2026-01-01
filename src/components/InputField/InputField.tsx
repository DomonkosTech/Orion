import React from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode; // Supports strings or icons/components
    error?: string;
    containerClassName?: string; // To pass styles.field or styles.fieldFull
}

const InputField: React.FC<InputFieldProps> = ({
                                                   label,
                                                   error,
                                                   id,
                                                   className,
                                                   containerClassName,
                                                   ...props
                                               }) => {
    return (
        <div className={`${styles.container} ${containerClassName || ''}`}>
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`${styles.input} ${error ? styles.inputError : ''} ${className || ''}`}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default InputField;