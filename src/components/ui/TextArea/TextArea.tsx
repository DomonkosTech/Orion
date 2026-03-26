import React, { useState, useEffect, useRef } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    maxLength?: number;
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
    const [currentLength, setCurrentLength] = useState(0);
    const textAreaRef = useRef<HTMLTextAreaElement>(null); // Ref for height calculation

    // Function to adjust height dynamically
    const adjustHeight = () => {
        const element = textAreaRef.current;
        if (element) {
            element.style.height = 'auto'; // Reset height to recalculate
            element.style.height = `${element.scrollHeight}px`; // Set to scroll height
        }
    };

    useEffect(() => {
        if (typeof value === 'string') {
            setCurrentLength(value.length);
        }
        adjustHeight(); // Adjust height whenever value changes
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCurrentLength(e.target.value.length);
        if (onChange) {
            onChange(e);
        }
        adjustHeight(); // Adjust height on user input
    };

    return (
        <div className={styles.container}>
            <label htmlFor={id} className={styles.label}>
                {label}
            </label>

            <textarea
                ref={textAreaRef}
                id={id}
                className={`${styles.textarea} ${error ? styles.inputError : ''}`}
                maxLength={maxLength}
                value={value}
                onChange={handleChange}
                rows={1} // Start small and grow
                {...props}
            />

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