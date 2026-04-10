import { describe, it, expect } from 'vitest';
import { loginSchema, userRegisterSchema, companyRegisterSchema } from '../Validation';

describe('loginSchema', () => {
  it('should validate a correct login object', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
      rememberMe: true,
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject an invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
      rememberMe: true,
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Érvénytelen email cím formátum');
    }
  });

  it('should reject a short password', () => {
    const invalidData = {
      email: 'test@example.com',
      password: '',
      rememberMe: true,
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('A jelszó megadása kötelező');
    }
  });
});

describe('userRegisterSchema', () => {
  it('should reject non-matching passwords', () => {
    const data = {
      email: 'test@test.com',
      password: 'Password123!',
      confirmPassword: 'Different123!',
      lname: 'Kovács',
      fname: 'János',
      birth_place: 'Budapest',
      birth_date: '1990-01-01',
      address: 'Fő utca 1.',
      phone_number: '06301234567',
      tax_number: '1234567890',
      nationality: 'Magyar',
      qualifications: 'Egyetemi végzettség',
      short_bio: 'Rövid bemutatkozás',
      personal_id: '123456AB',
      address_card_number: '123456CD',
      terms_accepted: true,
    };
    const result = userRegisterSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.message === 'A jelszavak nem egyeznek')).toBe(true);
    }
  });

  it('should reject a future birth date', () => {
    const data = {
      email: 'test@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      lname: 'Kovács',
      fname: 'János',
      birth_place: 'Budapest',
      birth_date: '2099-01-01',
      address: 'Fő utca 1.',
      phone_number: '06301234567',
      tax_number: '1234567890',
      nationality: 'Magyar',
      qualifications: 'Egyetemi végzettség Egyetemi végzettség',
      short_bio: 'Rövid bemutatkozás Rövid bemutatkozás',
      personal_id: '123456AB',
      address_card_number: '123456CD',
      terms_accepted: true,
    };
    const result = userRegisterSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors.some(e => e.message === 'A születési dátum nem lehet a jövőben')).toBe(true);
    }
  });
});

describe('companyRegisterSchema', () => {
  it('should reject invalid Hungarian tax number format', () => {
    const data = {
      email: 'company@test.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      name: 'Teszt Kft',
      address: 'Ipari park 1.',
      tax_number: '1234567890', // Invalid, needs format 12345678-X-YY
      contact_person_name: 'Teszt Elek',
      activity_scope: 'Szoftverfejlesztés és tanácsadás szoftverfejlesztés',
      website: 'https://test.hu',
      short_description: 'Nagyon jó cég vagyunk, gyere hozzánk dolgozni',
      phone_number: '06201234567',
      terms_accepted: true,
    };
    const result = companyRegisterSchema.safeParse(data);
    expect(result.success).toBe(false);
    if (!result.success) {
       expect(result.error.errors.some(e => e.message === 'Az adószám pontosan 13 karakter')).toBe(true);
    }
  });
});
