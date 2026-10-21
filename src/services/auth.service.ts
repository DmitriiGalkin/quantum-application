import jwt from 'jsonwebtoken';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';
import type { PassportExtendedDto, Passport, UpdatePassportInput } from 'entities';
import { HttpError } from '../utils/http-error.js';
import PlaceRepository from '../repositories/place.repository.js';
import ProjectRepository from '../repositories/project.repository.js';

export class AuthService {
  static async authenticateByToken(token: string): Promise<Passport | null> {
    const passport = await PassportRepository.findByAccessToken(token);
    return passport?.provider === 'quantum-directory' ? null : passport;
  }

  static async updateProfile(passport: Passport, data: UpdatePassportInput) {
    if (!Object.keys(data).length) {
      throw new HttpError('Нет полей для обновления', 400);
    }

    await PassportRepository.update(passport.id, { title: data.title, description: data.description, image: data.image });
  }

  static async login(passport: Passport) {
    if (passport.provider === 'quantum-directory') throw new HttpError('Directory profiles cannot sign in', 403);
    const token = jwt.sign({ id: passport.id }, process.env.JWT_SECRET || 'shhhhh', { expiresIn: '1h' });

    await PassportRepository.updateTokenById(token, passport.id);

    return token;
  }

  static async getFullProfile(passport: Passport): Promise<PassportExtendedDto> {
    const [users, places, projects] = await Promise.all([
      UserRepository.findByPassportId(passport.id),
      PlaceRepository.findByPassportId(passport.id),
      ProjectRepository.findAll({ passportId: passport.id }),
    ]);

    return {
      ...passport,
      users,
      places,
      isTeacher: projects.length > 0,
    };
  }

}
