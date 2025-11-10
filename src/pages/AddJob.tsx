
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const AddJob: React.FC = () => {
    const [formData, setFormData] = useState({
        position: "",
        hourly_wage: "",
        tasks: "",
        requirements: "",
        job_description: "",
        is_active: true,
    });

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.position.trim() || !formData.hourly_wage.trim()) {
            alert("Kérlek, töltsd ki a pozíció és órabér mezőket!");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:4000/api/addadvertisment/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    position: formData.position,
                    hourly_wage: parseFloat(formData.hourly_wage),
                    tasks: formData.tasks,
                    requirements: formData.requirements,
                    job_description: formData.job_description,
                    is_active: formData.is_active,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Hiba a hirdetés létrehozása során");
                return;
            }

            alert("Sikeres hirdetés létrehozás!");
            navigate("/");
        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>Álláshirdetés létrehozása</h1>

            <div>
                <label htmlFor="position">Pozíció *</label>
                <input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="pl. Raktáros"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="hourly_wage">Órabér (Ft) *</label>
                <input
                    id="hourly_wage"
                    name="hourly_wage"
                    type="number"
                    placeholder="2000"
                    value={formData.hourly_wage}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="job_description">Munka leírása</label>
                <textarea
                    id="job_description"
                    name="job_description"
                    placeholder="Részletes leírás a munkáról..."
                    rows={4}
                    value={formData.job_description}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="tasks">Feladatok</label>
                <textarea
                    id="tasks"
                    name="tasks"
                    placeholder="A munka feladatai..."
                    rows={3}
                    value={formData.tasks}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="requirements">Követelmények</label>
                <textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Elvárások a jelentkezőkkel szemben..."
                    rows={3}
                    value={formData.requirements}
                    onChange={handleInputChange}
                />
            </div>



            <div>
                <label>
                    <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                    />
                    Aktív hirdetés
                </label>
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Létrehozás..." : "Hirdetés létrehozása"}
            </button>

            <button type="button" onClick={() => navigate("/")}>
                Vissza a főoldalra
            </button>
        </form>
    );
};

export default AddJob;