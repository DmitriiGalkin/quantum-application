import Meet from '../repositories/meet.repository.js';
import { Passport } from '../entities/passport.js';
import type { CreateMeet, CreateProject, GetMeetsQuery } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import { ProjectService } from './project.service.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { User } from '../entities/user.js';
import PlaceRepository from '../repositories/place.repository.js';
import { Place } from '../entities/place.js';
import PassportRepository from '../repositories/passport.repository.js';

export class MeetService {
  static async create(passport: Passport, data: CreateMeet) {
    if (!passport) throw new Error('UNAUTHORIZED');
    const project = await ProjectRepository.findById(data.projectId);

    if (!project) throw new Error('MeetService project не существуйет');

    return MeetRepository.create({
      ...data,
      passportId: passport.id,
      placeId: project.placeId,
    });
  }

  static async update(data: any) {
    return Meet.update(data.id, data);
  }

  static async remove(id: number) {
    return Meet.delete(id);
  }

  static async findById(id: number) {
    return Meet.findById(id);
  }

  static async findAll(data: GetMeetsQuery) {
    const meets = await Meet.findAll(data);

    const places = await Promise.all(meets.map(i => PlaceRepository.findById(i.placeId) as Promise<Place>));
    const users = await Promise.all(meets.map(meet => UserRepository.findByMeetId(meet.id)));
    const passports = await Promise.all(meets.map(meet => PassportRepository.findById(meet.id)));

    return meets.map((meet, i) => ({
      ...meet,
      place: places[i],
      users: users[i],
      passport: passports[i],
    }));
  }
}
