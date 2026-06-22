import jwt from 'jsonwebtoken';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';

export class AuthService {
  static async updateProfile(passport: any, data: any) {
    if (!Object.keys(data).length) {
      throw new Error('EMPTY_UPDATE');
    }

    await PassportRepository.update(passport.id, data);
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
