import React, { useState, useEffect } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    maxLength?: number; // Optional limit
}

const TextArea: React.FC<TextAreaProps> = ({
                                               label,
                                               error,
                                               id,
                                               maxLength,
                                               value,
                                               onChange,
                                               ...props
                                           }) => {
    // We track length internally to show the counter immediately
    const [currentLength, setCurrentLength] = useState(0);

    // Sync local state if the 'value' prop changes from outside
    useEffect(() => {
        if (typeof value === 'string') {
            setCurrentLength(value.length);
        } else if (typeof value === 'number') {
            setCurrentLength(String(value).length);
        }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentLength(e.target.value.length);
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <textarea
                id={id}
                className={`${styles.textarea} ${error ? styles.inputError : ''}`}
                maxLength={maxLength}
                value={value}
                onChange={handleChange}
                {...props}
            />

            {/* Footer area for Error and Counter */}
            <div className={styles.footer}>
                {error && <span className={styles.errorMessage}>{error}</span>}

                {maxLength && (
                    <span className={styles.charCount}>
                        {currentLength} / {maxLength}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TextArea;