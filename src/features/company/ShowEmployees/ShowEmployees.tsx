import { useEffect, useState } from 'react';
import { getEmployees } from "../../../services/advertisementService.ts";

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

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Employees List</h1>
            <table border={1}>
                <thead>
                <tr>
                    <th>Vezetéknév</th>
                    <th>Keresztnév</th>
                    <th>Email</th>
                    <th>pozicíó</th>
                    <th>munka cime</th>
                    <th>munkabér</th>
                    <th>munka kezdete</th>
                </tr>
                </thead>
                <tbody>
                {employees.map((employee) => (
                    <tr key={employee.id}>
                        <td>{employee.users?.lname }</td>
                        <td>{employee.users?.fname }</td>
                        <td>{employee.users?.email }</td>
                        <td>{employee.position}</td>
                        <td>{employee.job_title}</td>
                        <td>{employee.hourly_wage}</td>
                        <td>{employee.hire_date}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ShowEmployees;
