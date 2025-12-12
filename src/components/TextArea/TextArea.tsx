import React from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({ label, error, id, ...props }) => {
    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>{label}</label>
            <textarea
                id={id}
                className={`${styles.textarea} ${error ? styles.inputError : ''}`}
                {...props}
            />
            {error && <span className={styles.errorMessage}>{error}</span>}
        </div>
    );
};

export default TextArea;
