// src/services/userServise.ts

// A UserRegistrationData interfész definiálása a regisztrációs adatok típusának meghatározására.
// Ez biztosítja a típusbiztonságot a komponens és a szolgáltatás között.
export interface UserRegistrationData {
    email: string;
    password: string;
    lname: string;
    fname: string;
    phone_number: string;
    birth_place: string;
    birth_date: string;
    address: string;
    tax_number: string;
    nationality: string;
    short_bio: string;
    qualifications: string;
    terms_accepted: boolean;
    personal_id: string;
    address_card_number: string;
}

const API_BASE_URL = "http://localhost:4000/api/user";

export const registerUser = async (userData: UserRegistrationData) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
    });

    const responseData = await response.json();

    if (!response.ok) {
        // A szerver által küldött hibaüzenetet használjuk, ha van, egyébként egy általános hibaüzenetet.
        throw new Error(responseData.error || "Hiba történt a regisztráció során.");
    }

    return responseData;
};
