import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const CompanyRegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "",
        address: "",
        taxNumber: "",
        contactPersonName: "",
        activityScope: "",
        website: "",
        shortDescription: "",
        phoneNumber: "",
        termsAccepted: false
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        // Alap validáció
        if (!formData.email.trim() || !formData.password.trim()) {
            alert("Kérlek, töltsd ki az email és jelszó mezőket!");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert("A jelszavak nem egyeznek!");
            return;
        }

        if (!formData.termsAccepted) {
            alert("El kell fogadnia a felhasználási feltételeket!");
            return;
        }

        setIsLoading(true);

        try {
            // Cégtábla feltöltése
            const companyResponse = await fetch("http://localhost:4000/api/company/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    address: formData.address,
                    tax_number: formData.taxNumber,
                    contact_person_name: formData.contactPersonName,
                    activity_scope: formData.activityScope,
                    website: formData.website,
                    short_description: formData.shortDescription,
                    phone_number: formData.phoneNumber,
                    terms_accepted: formData.termsAccepted
                }),
            });

            const companyData = await companyResponse.json();

            if (!companyResponse.ok) {
                alert(companyData.error || "Hiba a céges regisztráció során");
                return;
            }

            // Céges hitelesítő adatok mentése
            const credentialsResponse = await fetch("http://localhost:4000/api/company/register/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    company_id: companyData.companyId,
                    password: formData.password
                }),
            });

            const credentialsData = await credentialsResponse.json();

            if (!credentialsResponse.ok) {
                alert(credentialsData.error || "Hiba a jelszó mentése során");
                return;
            }

            alert("Sikeres céges regisztráció! Most már bejelentkezhet.");
            navigate("/CompanyLoginPage");
        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <div>
                <label>Email cím *</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Jelszó *</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Jelszó megerősítése *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Cég neve *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Lakcím *</label>
                <input type="text" name="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Adószám *</label>
                <input type="text" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Kapcsolattartó neve *</label>
                <input type="text" name="contactPersonName" value={formData.contactPersonName} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Tevékenységi kör *</label>
                <input type="text" name="activityScope" value={formData.activityScope} onChange={handleInputChange} required />
            </div>
            <div>
                <label>Weboldal</label>
                <input type="text" name="website" value={formData.website} onChange={handleInputChange} />
            </div>
            <div>
                <label>Rövid bemutatkozás *</label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} rows={3} required />
            </div>
            <div>
                <label>Telefonszám *</label>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required />
            </div>
            <div>
                <label>
                    <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange} required />
                    Elfogadom a <a href="/terms">felhasználási feltételeket</a> *
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? "Regisztráció..." : "Regisztráció"}
            </button>
            <button type="button" onClick={() => navigate("/CompanyLoginPage")}>Bejelentkezés</button>
        </form>
    );
};

export default CompanyRegisterPage;
