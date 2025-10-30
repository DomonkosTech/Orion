import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

const UserRegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        birthDate: "",
        birthPlace: "",
        address: "",
        personalId: "",
        addressCardNumber: "",
        taxNumber: "",
        nationality: "",
        qualifications: "",
        shortBio: "",
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
            const userResponse = await fetch("http://localhost:4000/api/user/register", {
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
            const credentialsResponse = await fetch("http://localhost:4000/api/user/register/credentials", {
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

            const documentsResponse = await fetch("http://localhost:4000/api/user/register/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userData.userId,
                    personal_id: formData.personalId,
                    address_card_number: formData.addressCardNumber
                }),
            })

            const documentsData = await documentsResponse.json();

            if (!documentsResponse.ok) {
                alert(documentsData.error || "Hiba a személyes adatok mentése során");
                return;
            }


            alert("Sikeres regisztráció! Most már bejelentkezhet.");
            navigate("/UserLoginPage");
        } catch (err) {
            console.error(err);
            alert("Hálózati hiba történt");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleRegister}>
            <h1>Felhasználó regisztráció</h1>

            <div>
                <label htmlFor="email">Email cím *</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@pelda.hu"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="password">Jelszó *</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="confirmPassword">Jelszó megerősítése *</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="phoneNumber">Telefonszám</label>
                <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="+36 30 123 4567"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="birthDate">Születési dátum</label>
                <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="birthPlace">Születési hely</label>
                <input
                    id="birthPlace"
                    name="birthPlace"
                    type="text"
                    placeholder="Születési hely"
                    value={formData.birthPlace}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="address">Lakcím</label>
                <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Teljes lakcím"
                    value={formData.address}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="personalId">Személyi szám</label>
                <input
                    id="personalId"
                    name="personalId"
                    type="text"
                    placeholder="123456AB"
                    value={formData.personalId}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="addressCardNumber">Lakcímkártya szám</label>
                <input
                    id="addressCardNumber"
                    name="addressCardNumber"
                    type="text"
                    placeholder="AA1234567"
                    value={formData.addressCardNumber}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="taxNumber">Adószám</label>
                <input
                    id="taxNumber"
                    name="taxNumber"
                    type="text"
                    placeholder="12345678-1-12"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="nationality">Állampolgárság</label>
                <input
                    id="nationality"
                    name="nationality"
                    type="text"
                    placeholder="Magyar"
                    value={formData.nationality}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="qualifications">Végzettség</label>
                <input
                    id="qualifications"
                    name="qualifications"
                    type="text"
                    placeholder="Végzettségek"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label htmlFor="shortBio">Rövid bemutatkozás</label>
                <textarea
                    id="shortBio"
                    name="shortBio"
                    placeholder="Írjon magáról néhány sort..."
                    rows={3}
                    value={formData.shortBio}
                    onChange={handleInputChange}
                />
            </div>

            <div>
                <label>
                    <input
                        type="checkbox"
                        name="termsAccepted"
                        checked={formData.termsAccepted}
                        onChange={handleInputChange}
                        required
                    />
                    Elfogadom a <a href="/terms">felhasználási feltételeket</a> *
                </label>
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? "Regisztráció..." : "Regisztráció"}
            </button>

            <button type="button" onClick={() => navigate("/UserLoginPage")}>
                Bejelentkezés
            </button>

            <p>
                Már van fiókja? <a href="#" onClick={() => navigate("/UserLoginPage")}>Jelentkezzen be itt</a>
            </p>
        </form>


    );
};

export default UserRegisterPage;