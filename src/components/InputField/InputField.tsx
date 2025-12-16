import React from 'react';
import styles from './InputField.module.css';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, id, ...props }) => {
    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <input
                id={id}
                className={`${styles.input} ${error ? styles.inputError : ''}`}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default InputField;