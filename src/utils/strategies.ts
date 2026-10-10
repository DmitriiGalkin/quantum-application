import { Strategy as YandexStrategy, type Profile } from 'passport-yandex';
import PassportRepository from '../repositories/passport.repository.js';
import type { Passport } from 'entities';

async function findOrCreate(accessToken: string, profile: Profile): Promise<Passport | null> {
  const email = profile.emails?.[0]?.value ?? (profile.username && profile.provider ? `${profile.username}@${profile.provider}.com` : '');
  if (!email) throw new Error('Провайдер не вернул адрес пользователя');
  const existing = await PassportRepository.findByEmail(email);
  if (existing) {
    await PassportRepository.updateTokenById(accessToken, existing.id);
    return { ...existing, accessToken };
  }
  const id = await PassportRepository.create({
    provider: profile.provider, providerId: profile.id, accessToken,
    title: profile.displayName, email, image: profile.photos?.[0]?.value ?? null,
  });
  return PassportRepository.findById(id);
}

const apiUrl = process.env.VITE_API_URL || process.env.BACKEND_SERVER;
export default {
  yandex: new YandexStrategy<Passport | null>({
    clientID: process.env.YANDEX_STRATEGY_CLIENT_ID ?? '',
    clientSecret: process.env.YANDEX_STRATEGY_CLIENT_SECRET ?? '',
    callbackURL: apiUrl + '/oauth2/redirect/yandex',
  }, (accessToken, _refreshToken, profile, done) => {
    void findOrCreate(accessToken, profile).then(user => done(null, user)).catch(error => {
      console.error('Ошибка в стратегии Passport:', error);
      done(error instanceof Error ? error.message : 'Ошибка авторизации', null);
    });
  }),
};
