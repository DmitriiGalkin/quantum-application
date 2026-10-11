import { expect, it, vi } from 'vitest';
import type { Passport } from '../entities/passport.js';
vi.mock('../repositories/passport.repository.js', () => ({ default: { findByAccessToken: vi.fn(), updateTokenById: vi.fn() } }));
import PassportRepository from '../repositories/passport.repository.js';
import { AuthService } from './auth.service.js';

it('directory profiles cannot authenticate or receive a login token', async () => {
  const profile = { id: 100, provider: 'quantum-directory', email: null, accessToken: null } as Passport;
  vi.mocked(PassportRepository.findByAccessToken).mockResolvedValue(profile);
  expect(await AuthService.authenticateByToken('unexpected-token')).toBeNull();
  await expect(AuthService.login(profile)).rejects.toMatchObject({ status: 403 });
  expect(PassportRepository.updateTokenById).not.toHaveBeenCalled();
});
it('existing OAuth profiles retain their authentication behavior', async () => {
  const profile = { id: 42, provider: 'yandex', accessToken: 'existing-token' } as Passport;
  vi.mocked(PassportRepository.findByAccessToken).mockResolvedValue(profile);
  expect(await AuthService.authenticateByToken('existing-token')).toBe(profile);
});
