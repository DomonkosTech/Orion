import { z } from "zod";

// --- Felhasználó Regisztráció Validáció ---
export const userRegisterSchema = z.object({
    email: z.string().email("Érvénytelen email cím"),
    password: z.string()
        .min(8, "A jelszónak legalább 8 karakternek kell lennie")
        .regex(/[a-z]/, "Tartalmaznia kell legalább egy kisbetűt")
        .regex(/[A-Z]/, "Tartalmaznia kell legalább egy nagybetűt")
        .regex(/[0-9]/, "Tartalmaznia kell legalább egy számot")
        .regex(/[^a-zA-Z0-9]/, "Tartalmaznia kell legalább egy speciális szimbólumot"),
    confirmPassword: z.string(),
    lname: z.string().min(2, "Vezetéknév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    fname: z.string().min(2, "Keresztnév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    birth_place: z.string().min(2, "Születési hely legalább 2 karakter"),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Érvénytelen dátum"),
    address: z.string().min(5, "A cím legalább 5 karakter"),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám"),
    tax_number: z.string()
        .trim()
        .min(1, { message: "Az adószám kötelező" })
        .regex(/^[0-9-]+$/i, { message: "Az adószám csak számokat és kötőjelet tartalmazhat" }),
    nationality: z.string().min(5, "A nemzetiseg legalább 5 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    qualifications: z.string().min(10, "A végzettségek legalább 10 karakter"),
    short_bio: z.string().min(10, "A bemutatkozás legalább 10 karakter").max(250, "A bemutatkozás maximum 250 karakter lehet"),
    personal_id: z.string()
        .length(8, "A személyi igazolvány számnak pontosan 8 karakternek kell lennie")
        .regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum (példa: 123456AB)"),
    address_card_number: z.string()
        .length(8, "A lakcímkártya számnak pontosan 8 karakternek kell lennie")
        .regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum (példa: 123456AB)"),
    terms_accepted: z.literal(true, { errorMap: () => ({ message: "El kell fogadnia a feltételeket" }) }),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "A jelszavak nem egyeznek",
            path: ["confirmPassword"],
        });
    }
});

// --- Cég Regisztráció Validáció ---
export const companyRegisterSchema = z.object({
    email: z.string().email("Érvénytelen email cím"),
    password: z.string()
        .min(8, "A jelszónak legalább 8 karakternek kell lennie")
        .regex(/[a-z]/, "Tartalmaznia kell legalább egy kisbetűt")
        .regex(/[A-Z]/, "Tartalmaznia kell legalább egy nagybetűt")
        .regex(/[0-9]/, "Tartalmaznia kell legalább egy számot")
        .regex(/[^a-zA-Z0-9]/, "Tartalmaznia kell legalább egy speciális szimbólumot"),
    confirmPassword: z.string(),
    name: z.string().min(2, "A cégnév legalább 2 karakter"),
    address: z.string().min(5, "A cím legalább 5 karakter"),
    taxNumber: z.string()
        .length(13, "Az adószám pontosan 13 karakter kell legyen")
        .regex(/^\d{8}-\d{1}-\d{2}$/, "Érvénytelen formátum. Helyes alak: 12345678-X-YY"),
    contactPersonName: z.string().min(2, "Kapcsolattartó neve legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat"),
    activityScope: z.string().min(15, "Tevékenységi kör megadása kötelező (min. 15 karakter)"),
    website: z
        .string()
        .trim()
        .optional()
        .refine((v: string | undefined) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v), {
            message: "Érvénytelen weboldal cím",
        }),
    shortDescription: z.string().min(10, "A leírás legalább 10 karakter legyen").max(500, "Maximum 500 karakter"),
    phoneNumber: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám"),
    termsAccepted: z.literal(true, { errorMap: () => ({ message: "El kell fogadnia a feltételeket" }) }),
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "A jelszavak nem egyeznek",
            path: ["confirmPassword"],
        });
    }
});

// --- Bejelentkezés Validáció ---
export const loginSchema = z.object({
    email: z.string().email("Érvénytelen email cím formátum"),
    password: z.string().min(4, "A jelszó megadása kötelező"),
    rememberMe: z.boolean(),
});

// --- Felhasználói Profil Módosítás Validáció ---
export const userUpdateProfileSchema = z.object({
    email: z.string().email("Érvénytelen email cím").optional(), // Opcionális email frissítés
    lname: z.string().min(2, "Vezetéknév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    fname: z.string().min(2, "Keresztnév legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    birth_place: z.string().min(2, "Születési hely legalább 2 karakter").optional(),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Érvénytelen dátum").optional(),
    address: z.string().min(5, "A cím legalább 5 karakter").optional(),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám").optional(),
    tax_number: z.string()
        .trim()
        .regex(/^[0-9-]+$/i, { message: "Az adószám csak számokat és kötőjelet tartalmazhat" })
        .optional(),
    nationality: z.string().min(5, "A nemzetiseg legalább 5 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    qualifications: z.string().min(10, "A végzettségek legalább 10 karakter").optional(),
    short_bio: z.string().min(10, "A bemutatkozás legalább 10 karakter").max(250, "A bemutatkozás maximum 250 karakter lehet").optional(),
    documents: z.object({
        personal_id: z.string()
            .length(8, "A személyi igazolvány számnak pontosan 8 karakternek kell lennie")
            .regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum (példa: 123456AB)"),
        address_card_number: z.string()
            .length(8, "A lakcímkártya számnak pontosan 8 karakternek kell lennie")
            .regex(/^\d{6}[A-Z]{2}$/, "Érvénytelen formátum (példa: 123456AB)"),
    }).optional(), // A dokumentumok (személyi, lakcímkártya) együtt frissíthetők
});


// --- Céges Profil Módosítás Validáció ---
export const companyUpdateProfileSchema = z.object({
    name: z.string().min(2, "A cégnév legalább 2 karakter").optional(),
    address: z.string().min(5, "A cím legalább 5 karakter").optional(),
    tax_number: z.string()
        .length(13, "Az adószám pontosan 13 karakter kell legyen")
        .regex(/^\d{8}-\d{1}-\d{2}$/, "Érvénytelen formátum. Helyes alak: 12345678-X-YY")
        .optional(),
    contact_person_name: z.string().min(2, "Kapcsolattartó neve legalább 2 karakter").regex(/^[a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s]+$/, "A mező csak betűket tartalmazhat").optional(),
    activity_scope: z.string().min(15, "Tevékenységi kör megadása kötelező (min. 15 karakter)").optional(),
    website: z
        .string()
        .trim()
        .optional()
        .refine((v: string | undefined) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v), {
            message: "Érvénytelen weboldal cím",
        }),
    short_description: z.string().min(10, "A leírás legalább 10 karakter legyen").max(500, "Maximum 500 karakter").optional(),
    phone_number: z.string().regex(/^[0-9+\s-]{7,20}$/, "Érvénytelen telefonszám").optional(),
});



export type UserRegisterInput = z.infer<typeof userRegisterSchema>;
export type CompanyRegisterInput = z.infer<typeof companyRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UserUpdateProfileInput = z.infer<typeof userUpdateProfileSchema>;
export type CompanyUpdateProfileInput = z.infer<typeof companyUpdateProfileSchema>;