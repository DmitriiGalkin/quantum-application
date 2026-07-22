import { Passport } from '../entities/passport.js';
import type { CreateMeet, GetMeetsQuery, MeetExtendedDto, MeetStatus } from '@shared/types';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import UserRepository from '../repositories/user.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import { Place } from '../entities/place.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';

export class MeetService {
  static async create(passport: Passport, data: CreateMeet) {
    console.log(data, 'data');
    if (!passport) throw new Error('UNAUTHORIZED');
    const project = await ProjectRepository.findById(data.projectId);
    console.log(project, 'project');

    if (!project) throw new Error('MeetService project не существуйет');
    console.log('3');

    return MeetRepository.create({
      ...data,
      passportId: passport.id,
      placeId: project.placeId,
    });
  }

  static async update(data: any) {
    return MeetRepository.update(data.id, data);
  }

  static async remove(id: number) {
    return MeetRepository.delete(id);
  }

  static async findById(id: number): Promise<MeetExtendedDto | null> {
    const meet = await MeetRepository.findById(id);
    if (!meet) return null;

    const [place, users, passport, projectUsers] = await Promise.all([
      PlaceRepository.findById(meet.placeId) as Promise<Place>,
      UserRepository.findByMeetId(meet.id),
      PassportRepository.findById(meet.passportId) as Promise<Passport>,
      ProjectUserRepository.findByProjectId(meet.projectId),
    ]);

    return { ...meet, place, users, passport, capacity: projectUsers.length };
  }

  static async findAll(data: GetMeetsQuery): Promise<MeetExtendedDto[]> {
    const meets = await MeetRepository.findAll(data);
    const places = await Promise.all(meets.map(i => PlaceRepository.findById(i.placeId) as Promise<Place>));
    const users = await Promise.all(meets.map(meet => UserRepository.findByMeetId(meet.id)));
    const passports = await Promise.all(meets.map(meet => PassportRepository.findById(meet.passportId) as Promise<Passport>));
    const projectUsers = await Promise.all(meets.map(meet => ProjectUserRepository.findByProjectId(meet.projectId)));

    return meets.map((meet, i) => ({
      ...meet,
      place: places[i],
      users: users[i],
      passport: passports[i],
      capacity: projectUsers[i].length,
    }));
  }

  static async updateStatus(id: number, status: MeetStatus) {
    return MeetRepository.updateStatus(id, status);
  }
}
