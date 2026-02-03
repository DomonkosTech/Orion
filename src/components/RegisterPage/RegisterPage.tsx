import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import { z, ZodSchema } from "zod";
import styles from "./RegisterPage.module.css";
import { useTranslation } from "react-i18next";

// Components
import Button from "../Button/Button.tsx";
import {Header} from "../Header/Header.tsx";
import Footer from "../Footer/Footer.tsx";

interface Step<T> {
    label: string;
    render: (props: {
        formData: T;
        handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
        handleCheckboxChange: (name: string, checked: boolean) => void;
        errors: Record<string, string>;
    }) => React.ReactNode;
}

interface RegisterPageProps<T> {
    initialValues: T;
    steps: Step<T>[];
    stepSchemas: ZodSchema<any>[];
    finalSchema: ZodSchema<any>;
    onSubmit: (data: T) => Promise<void>;
    redirectPath: string;
    title: string;
    loginPath?: string;
}

const RegisterPage = <T extends Record<string, any>>({
    initialValues,
    steps,
    stepSchemas,
    finalSchema,
    onSubmit,
    redirectPath,
    title,
    loginPath
}: RegisterPageProps<T>) => {
    const { t } = useTranslation('components');
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<T>(initialValues);
    const topRef = useRef<HTMLDivElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleCheckboxChangeGeneric = (name: string, checked: boolean) => {
         setFormData(prev => ({ ...prev, [name]: checked }));
         if (errors[name]) {
             setErrors(prev => {
                 const newErrors = { ...prev };
                 delete newErrors[name];
                 return newErrors;
             });
         }
    }

    const validateStep = (currentStep: number) => {
        try {
            const schema = stepSchemas[currentStep - 1];
            schema.parse(formData);
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {};
                err.errors.forEach((error) => {
                    if (error.path[0]) {
                        formattedErrors[error.path[0] as string] = error.message;
                    }
                });
                setErrors(formattedErrors);
                toast.error(t('registerPage.fixErrors'));
            }
            return false;
        }
    };

    const nextStep = (e?: React.BaseSyntheticEvent) => {
        e?.preventDefault();
        if (validateStep(step)) {
            setStep(s => s + 1);
            setTimeout(() => {
                topRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    };

    const prevStep = () => {
        setErrors({});
        setStep(s => s - 1);
        setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = finalSchema.safeParse(formData);

        if (!result.success) {
            const formattedErrors: Record<string, string> = {};
            result.error.errors.forEach((error) => {
                if (error.path[0]) {
                    formattedErrors[error.path[0] as string] = error.message;
                }
            });
            setErrors(formattedErrors);
            toast.error(t('registerPage.checkData'));
            return;
        }

        setIsLoading(true);
        try {
            await onSubmit(formData);
            toast.success(t('registerPage.success'));
            setTimeout(() => navigate(redirectPath), 1500);
        } catch (err: unknown) {
            toast.error(err instanceof Error ? err.message : t('registerPage.networkError'));
        } finally {
            setIsLoading(false);
        }
    };

    // Global Enter key listener
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (step < steps.length) {
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.tagName === 'BUTTON') {
                        return;
                    }

                    e.preventDefault();
                    nextStep();
                }
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [step, steps.length, formData]);

    return (
        <>
            <Header />
            <div className={styles.page}>
                <Toaster />
                <div className={styles.container} ref={topRef}>
                    <div className={styles.card}>
                        <header className={styles.header}>
                            <h1>{title}</h1>
                            <p>{t('registerPage.step', { step, totalSteps: steps.length, label: steps[step - 1].label })}</p>
                            <div className={styles.stepper}>
                                {steps.map((_, index) => (
                                    <div key={index} className={`${styles.step} ${step === index + 1 ? styles.current : ""} ${step > index + 1 ? styles.completed : ""}`} />
                                ))}
                            </div>
                        </header>

                        <form onSubmit={handleRegister} className={styles.form}>
                            <section className={styles.section}>
                                {steps[step - 1].render({
                                    formData,
                                    handleChange,
                                    handleCheckboxChange: handleCheckboxChangeGeneric,
                                    errors
                                })}
                            </section>

                            <div className={styles.footer}>
                                {step > 1 && <Button type="button" variant="secondary" color="orion-blue" onClick={prevStep}>{t('registerPage.back')}</Button>}
                                {step < steps.length ? (
                                    <Button type="button" variant="primary" color="orion-blue" onClick={nextStep}>{t('registerPage.continue')}</Button>
                                ) : (
                                    <Button type="submit" isLoading={isLoading} variant="primary" color="orion-blue">{t('registerPage.finishRegistration')}</Button>
                                )}
                            </div>
                            {loginPath && (
                                <div className={styles.loginLink}>
                                    {t('registerPage.alreadyHaveAccount')}{" "} <span onClick={() => navigate(loginPath)}>{t('registerPage.loginHere')}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    );
};

export default RegisterPage;