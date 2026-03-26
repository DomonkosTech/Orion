import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import styles from './ConfirmModal.module.css';
import Button from '../Button/Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    icon
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className={styles.overlay}>
                    <motion.div 
                        className={styles.backdrop}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <div className={styles.modalWrapper}>
                        <motion.div 
                            className={styles.modal}
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                                <X size={20} />
                            </button>
                            
                            <div className={styles.content}>
                                <div className={`${styles.iconContainer} ${styles[type]}`}>
                                    {icon || <AlertCircle size={22} />}
                                </div>
                                <div className={styles.textContent}>
                                    <h2 className={styles.title}>{title}</h2>
                                    <p className={styles.message}>{message}</p>
                                </div>
                            </div>
                            
                            <div className={styles.footer}>
                                <Button variant="secondary" onClick={onClose} className={styles.btn}>
                                    {cancelText}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    color={type === 'danger' ? 'danger' : 'orion-blue'} 
                                    onClick={() => { onConfirm(); onClose(); }}
                                    className={styles.btn}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmModal;
