import { z } from "zod";

export const companyRegisterSchema = z
  .object({
    email: z.string().trim().email({ message: "Érvénytelen e-mail cím" }),
    password: z
      .string()
      .trim()
      .min(8, { message: "A jelszónak legalább 8 karakter hosszúnak kell lennie" }),
    confirmPassword: z.string().trim(),
    name: z.string().trim().min(1, { message: "A cég neve kötelező" }),
    address: z.string().trim().min(1, { message: "A lakcím kötelező" }),
    taxNumber: z
      .string()
      .trim()
      .min(1, { message: "Az adószám kötelező" })
      .regex(/^[0-9-]+$/i, { message: "Az adószám csak számokat és kötőjelet tartalmazhat" }),
    contactPersonName: z.string().trim().min(1, { message: "A kapcsolattartó neve kötelező" }),
    activityScope: z.string().trim().min(1, { message: "A tevékenységi kör kötelező" }),
    website: z
      .string()
      .trim()
      .optional()
      .refine((v: string | undefined) => !v || /^https?:\/\//i.test(v) || /^[\w.-]+\.[a-z]{2,}$/i.test(v), {
        message: "Érvénytelen weboldal cím",
      }),
    shortDescription: z.string().trim().min(1, { message: "A bemutatkozás kötelező" }),
    phoneNumber: z
      .string()
      .trim()
      .min(1, { message: "A telefonszám kötelező" })
      .regex(/^[0-9+()\s-]{6,}$/i, { message: "Érvénytelen telefonszám formátum" }),
    termsAccepted: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A jelszavak nem egyeznek",
    path: ["confirmPassword"],
  })
  .refine((data) => data.termsAccepted === true, {
    message: "El kell fogadnia a felhasználási feltételeket!",
    path: ["termsAccepted"],
  });

export type CompanyRegisterForm = z.infer<typeof companyRegisterSchema>;
