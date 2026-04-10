import { describe, it, expect } from 'vitest';
import { checkAuthStatus } from '../../Api/authApi';

describe('Auth Integration (MSW)', () => {
  it('should return logged in status from mocked API', async () => {
    const status = await checkAuthStatus();
    expect(status.loggedIn).toBe(true);
    expect(status.userType).toBe('user');
    expect(status.fname).toBe('Test');
  });
});
