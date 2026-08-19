import jwt from 'jsonwebtoken';
import PassportRepository from '../repositories/passport.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { PassportExtendedDto } from 'dto';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import ProjectRepository from '../repositories/project.repository.js';

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

  static async getFullProfile(passport: any): Promise<PassportExtendedDto> {
    const users = await UserRepository.findByPassportId(passport.id || 0);
    const places = await PlaceRepository.findByPassportId(passport.id || 0);
    const isTeacher = await ProjectRepository.findAll({ passportId: passport.id });

    return {
      ...passport,
      users,
      places,
      isTeacher: Boolean(isTeacher.length),
    };
  }

}
