import jwt from 'jsonwebtoken';
import PassportRepository from '../models/passport.repository.js';
import UserRepository from '../models/user.repository.js';

export class AuthService {
  static async updateProfile(passport: any, data: any) {
    if (!Object.keys(data).length) {
      throw new Error('EMPTY_UPDATE');
    }

    await PassportRepository.update(passport.id, data);
  }

  static async googleLogin(data: any) {
    const { email, access_token, name, picture } = data;

    if (!email || !access_token) {
      throw new Error('INVALID_GOOGLE_DATA');
    }

    const existing = await PassportRepository.findByEmail(email);

    if (existing) {
      await PassportRepository.updateTokenById(access_token, existing.id);
      return { message: 'Токен пользователя обновлен' };
    }

    await PassportRepository.create({
      provider: 'google',
      providerId: 'google',
      accessToken: access_token,
      title: name,
      //image: picture,
      email,
    });

    return { message: 'Новый пользователь успешно создан' };
  }

  static async login(passport: any) {
    const token = jwt.sign({ id: passport.id }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: '1h' });

    await PassportRepository.updateTokenById(token, passport.id);

    return token;
  }

  static async getFullProfile(passport: any) {
    const users = await UserRepository.findByPassportId(passport.id || 0);

    return {
      ...passport,
      users,
    };
  }
}
