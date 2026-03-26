import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../../../Api/companyApi.ts";
import { toast } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import styles from "./ShowEmployees.module.css";

// Shared Components
import { Header } from "../../../components/Header/Header.tsx";
import Footer from "../../../components/Footer/Footer.tsx";
import BannerKicker from "../../../components/BannerKicker/BannerKicker.tsx";
import Button from "../../../components/Button/Button.tsx";

interface User {
    email: string;
    lname: string;
    fname: string;
}

interface Employee {
    id: number;
    user_id: number;
    company_id: number;
    position: string;
    job_title: string;
    hourly_wage: number;
    hire_date: string;
    users?: User;
}

const ShowEmployees = () => {
    const { t } = useTranslation('company');
    const navigate = useNavigate();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployees();
                if (data.success) {
                    setEmployees(data.employees);
                }
            } catch (error) {
                console.error("Error fetching employees:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm(t('employees.deleteConfirm'))) return;

        try {
            const response = await deleteEmployee(id);
            if (response.success) {
                setEmployees(employees.filter(employee => employee.id !== id));
                toast.success(t('employees.deleteSuccess'));
            } else {
                toast.error(t('employees.deleteError'));
            }
        } catch (error) {
            console.error(error)
            toast.error(t('employees.deleteErrorGeneric'));
        }
    };

    if (loading) return <div className={styles.loading}>{t('employees.loading')}</div>;

    return (

    <div className={styles.page}>
        <Header />

        <main className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <BannerKicker>{t('addJob.banner')}</BannerKicker>
                    <h1 className={styles.title}>{t('employees.title')}</h1>
                    <p className={styles.subtitle}>{t('employees.subtitle')}</p>
                </div>
                <div className={styles.actions}>
                    <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ArrowLeft size={18} /> {t('showJobs.back')}
                        </div>
                    </Button>
                </div>
            </header>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.employeeTable}>
                        <thead>
                        <tr>
                            <th>{t('employees.table.name')}</th>
                            <th>{t('employees.table.email')}</th>
                            <th>{t('employees.table.position')}</th>
                            <th>{t('employees.table.wage')}</th>
                            <th style={{ textAlign: 'right' }}>{t('employees.table.actions')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {employees.map((employee) => (
                            <tr key={employee.id}>
                                <td className={styles.nameCell}>
                                    {employee.users?.lname} {employee.users?.fname}
                                </td>
                                <td className={styles.emailCell}>{employee.users?.email}</td>
                                <td>{employee.position}</td>
                                <td className={styles.wageCell}>{employee.hourly_wage} Ft/óra</td>
                                <td style={{ textAlign: 'right' }}>
                                    <Button
                                        variant="secondary"
                                        color="danger"
                                        onClick={() => handleDelete(employee.id)}
                                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                    >
                                        {t('employees.fire')}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
        <Footer />
    </div>
    );
};

export default ShowEmployees;