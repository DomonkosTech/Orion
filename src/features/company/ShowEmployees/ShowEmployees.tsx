import { useEffect, useState } from 'react';
import { getEmployees, deleteEmployee } from "../../../api/advertisementApi.ts";
import { toast, Toaster } from "react-hot-toast";
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
        if (!window.confirm("Biztosan el akarja távolítani ezt az alkalmazottat?")) return;

        try {
            const response = await deleteEmployee(id);
            if (response.success) {
                setEmployees(employees.filter(employee => employee.id !== id));
                toast.success("Sikeresen eltávolítva");
            } else {
                toast.error("Sikertelen törlés");
            }
        } catch (error) {
            console.error(error)
            toast.error("Hiba történt a törlés során");
        }
    };

    if (loading) return <div className={styles.loading}>Betöltés...</div>;

    return (
        <div className={styles.page}>
            <Header />
            <Toaster position="top-center" />

            <main className={styles.container}>
                <header className={styles.header}>
                    <BannerKicker>Adminisztráció</BannerKicker>
                    <h1 className={styles.title}>Alkalmazottak kezelése</h1>
                    <p className={styles.subtitle}>A vállalat aktív munkavállalóinak nyilvántartása.</p>
                </header>

                <div className={styles.card}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.employeeTable}>
                            <thead>
                            <tr>
                                <th>Név</th>
                                <th>Email</th>
                                <th>Pozíció</th>
                                <th>Munkabér</th>
                                <th style={{ textAlign: 'right' }}>Műveletek</th>
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
                                            Kirúgás
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