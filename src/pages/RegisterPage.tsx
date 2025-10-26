import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        birthPlace: "",
        birthDate: "",
        address: "",
        taxNumber: "",
        nationality: "",
        shortBio: "",
        qualifications: "",
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

        // Basic validation
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
            // First create user in users table
            const userResponse = await fetch("http://localhost:4000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    phone_number: formData.phoneNumber,
                    birth_place: formData.birthPlace,
                    birth_date: formData.birthDate || null,
                    address: formData.address,
                    tax_number: formData.taxNumber,
                    nationality: formData.nationality,
                    terms_accepted: formData.termsAccepted,
                    short_bio: formData.shortBio,
                    qualifications: formData.qualifications
                }),
            });

            const userData = await userResponse.json();

            if (!userResponse.ok) {
                alert(userData.error || "Hiba a regisztráció során");
                return;
            }

            // Then create credentials
            const credentialsResponse = await fetch("http://localhost:4000/api/register/credentials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userData.userId,
                    password: formData.password
                }),
            });

            const credentialsData = await credentialsResponse.json();

            if (!credentialsResponse.ok) {
                alert(credentialsData.error || "Hiba a jelszó mentése során");
                return;
            }

            alert("Sikeres regisztráció! Most már bejelentkezhet.");
            navigate("/login");
        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            {/* Header */}
            <header className="login-header">
                <div className="logo">YourLogo</div>
                <nav className="navigation">
                    <button className="nav-btn" onClick={() => navigate("/")}>
                        Főoldal
                    </button>
                    <button className="nav-btn" onClick={() => navigate("/login")}>
                        Bejelentkezés
                    </button>
                </nav>
            </header>

            {/* Main Content */}
            <main className="login-content">
                <div className="login-card" style={{ maxWidth: "600px" }}>
                    <h1>Regisztráció</h1>
                    <p className="login-subtitle">
                        Hozzon létre egy új fiókot
                    </p>

                    <form className="login-form" onSubmit={handleRegister}>
                        {/* Required Fields */}
                        <div className="input-group">
                            <label htmlFor="email">Email cím *</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="form-input"
                                placeholder="email@pelda.hu"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Jelszó *</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Jelszó megerősítése *</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {/* Optional Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="phoneNumber">Telefonszám</label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    className="form-input"
                                    placeholder="+36 30 123 4567"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="birthDate">Születési dátum</label>
                                <input
                                    id="birthDate"
                                    name="birthDate"
                                    type="date"
                                    className="form-input"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="birthPlace">Születési hely</label>
                            <input
                                id="birthPlace"
                                name="birthPlace"
                                type="text"
                                className="form-input"
                                placeholder="Születési hely"
                                value={formData.birthPlace}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="address">Lakcím</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                className="form-input"
                                placeholder="Teljes lakcím"
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="input-group">
                                <label htmlFor="taxNumber">Adószám</label>
                                <input
                                    id="taxNumber"
                                    name="taxNumber"
                                    type="text"
                                    className="form-input"
                                    placeholder="12345678-1-12"
                                    value={formData.taxNumber}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="nationality">Állampolgárság</label>
                                <input
                                    id="nationality"
                                    name="nationality"
                                    type="text"
                                    className="form-input"
                                    placeholder="Magyar"
                                    value={formData.nationality}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="qualifications">Végzettség</label>
                            <input
                                id="qualifications"
                                name="qualifications"
                                type="text"
                                className="form-input"
                                placeholder="Végzettségek"
                                value={formData.qualifications}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="shortBio">Rövid bemutatkozás</label>
                            <textarea
                                id="shortBio"
                                name="shortBio"
                                className="form-input"
                                placeholder="Írjon magáról néhány sort..."
                                rows={3}
                                value={formData.shortBio}
                                onChange={handleInputChange}
                                style={{ resize: 'vertical', minHeight: '80px' }}
                            />
                        </div>

                        {/* Terms and Conditions */}
                        <div className="input-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleInputChange}
                                    required
                                />
                                Elfogadom a <a href="/terms" style={{ color: '#2c5aa0' }}>felhasználási feltételeket</a> *
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="login-btn primary"
                            disabled={isLoading}
                        >
                            {isLoading ? "Regisztráció..." : "Regisztráció"}
                        </button>

                        <div className="divider">
                            <span>vagy</span>
                        </div>

                        <button
                            type="button"
                            className="login-btn secondary"
                            onClick={() => navigate("/login")}
                        >
                            Bejelentkezés
                        </button>
                    </form>

                    <footer className="login-footer">
                        <p>
                            Már van fiókja?{" "}
                            <a href="#" onClick={() => navigate("/login")}>
                                Jelentkezzen be itt
                            </a>
                        </p>
                    </footer>
                </div>
            </main>

            {/* Footer */}
            <footer className="login-footer-bottom">
                <p>&copy; 2024 Your Company. Minden jog fenntartva.</p>
            </footer>
        </div>
    );
};

export default RegisterPage;