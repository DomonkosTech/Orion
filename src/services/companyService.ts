// companyService.ts

type RegisterCompanyPayload = {
    email: string;
    name: string;
    address: string;
    tax_number: string;
    contact_person_name: string;
    activity_scope: string;
    website?: string | null;
    short_description: string;
    phone_number: string;
    terms_accepted: boolean;
    [key: string]: unknown;
};

export class ServiceError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = "ServiceError";
        this.status = status;
    }
}

const BASE_URL =
    (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
    (typeof window !== 'undefined' ? (window as unknown as { VITE_API_URL?: string }).VITE_API_URL : undefined) ||
    "http://localhost:4000";

const sanitizePayload = <T extends Record<string, unknown>>(payload: T): T => {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
        if (typeof value === "string") {
            const trimmed = value.trim();
            if (/date/i.test(key) && trimmed === "") {
                result[key] = null;
            } else {
                result[key] = trimmed;
            }
        } else {
            result[key] = value;
        }
    }
    return result as T;
};

export const registerCompany = async (payload: RegisterCompanyPayload) => {
    const body = JSON.stringify(sanitizePayload(payload));
    const res = await fetch(`${BASE_URL}/api/company/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (res.status === 409) {
            throw new ServiceError(data.error || "E-mail cím már foglalt", 409);
        }
        throw new ServiceError(data.error || "Hiba a céges regisztráció során", res.status);
    }
    return data as { companyId: string };
};

export const registerCompanyCredentials = async (company_id: string, password: string) => {
    const body = JSON.stringify(sanitizePayload({ company_id, password }));
    const res = await fetch(`${BASE_URL}/api/company/register/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new ServiceError(data.error || "Hiba a jelszó mentése során", res.status);
    }
    return data;
};


export const loginCompany = async (email: string, password: string, rememberMe: boolean) => {
    const body = JSON.stringify({ email, password, rememberMe });
    const res = await fetch(`${BASE_URL}/api/company/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Essential for sessions/cookies
        body,
    });

    const contentType = res.headers.get("content-type") || "";
    let data;

    if (contentType.includes("application/json")) {
        data = await res.json();
    } else {
        // Handle cases where server returns HTML error pages (like Nginx 502, etc.)
        const text = await res.text();
        throw new ServiceError(`Szerver hiba (nem JSON válasz): ${text.substring(0, 100)}...`, res.status);
    }

    if (!res.ok) {
        throw new ServiceError(data.error || "Hibás bejelentkezési adatok", res.status);
    }

    return data; // Returns { success: true } usually
};

export const checkAuth = async () => {
    const res = await fetch(`${BASE_URL}/auth/check`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
    });
    // Safely parse JSON
    return res.json().catch(() => null);
};