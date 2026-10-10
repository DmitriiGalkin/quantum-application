import type { Passport, CreateMeet, GetMeetsQuery, MeetDto, MeetStatus, UpdateMeetInput, Meet } from 'entities';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import { ParticipantsService } from './participants.service.js';
import { HttpError } from '../utils/http-error.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';

export class MeetService {
  static async create(passport: Passport, data: CreateMeet) {
    if (!passport) throw new HttpError('UNAUTHORIZED', 401);
    const project = await ProjectRepository.findById(data.projectId);

    if (!project) throw new HttpError('Проект не найден', 404);
    if (project.passportId !== passport.id) throw new HttpError('Нет доступа к проекту', 403);

    return MeetRepository.create({
      ...data,
      passportId: passport.id,
      placeId: project.placeId,
    });
  }

  static async update(data: { id: number } & UpdateMeetInput, passportId: number) {
    const { id, ...fields } = data;

    const existingMeet = await MeetRepository.findById(id);
    if (!existingMeet) {
      throw new HttpError('Встреча не найдена', 404);
    }
    if (existingMeet.passportId !== passportId) throw new HttpError('Нет доступа к встрече', 403);

    const updateData: UpdateMeetInput = { startedAt: fields.startedAt, duration: fields.duration, price: fields.price };

    if (fields.startedAt !== undefined) {
      const existingTime = new Date(existingMeet.startedAt).getTime();
      const newTime = new Date(fields.startedAt).getTime();

      if (existingTime !== newTime || existingMeet.duration !== fields.duration) {
        updateData.status = 'pending';
      }
    }

    return MeetRepository.update(id, updateData);
  }

  static async remove(id: number, passportId: number) {
    const meet = await MeetRepository.findById(id);

    if (!meet) {
      throw new HttpError('Встреча не найдена', 404);
    }

    if (meet.passportId !== passportId) {
      throw new HttpError('Нет доступа к встрече', 403);
    }

    return MeetRepository.delete(id);
  }

  static async findById(id: number): Promise<MeetDto | null> {
    const meet = await MeetRepository.findById(id);
    return meet ? (await this.hydrateAll([meet]))[0] : null;
  }

  static async findAll(data: GetMeetsQuery): Promise<MeetDto[]> {
    return this.hydrateAll(await MeetRepository.findAll(data));
  }

  static async hydrateAll(meets: Meet[]): Promise<MeetDto[]> {
    const [places, passports, users, projectUsers] = await Promise.all([
      PlaceRepository.findByIds(meets.map(meet => meet.placeId)),
      PassportRepository.findByIds(meets.map(meet => meet.passportId)),
      ParticipantsService.forMeets(meets.map(meet => meet.id)),
      ProjectUserRepository.findByProjectIds(meets.map(meet => meet.projectId)),
    ]);
    const placeById = new Map(places.map(place => [place.id, place]));
    const passportById = new Map(passports.map(passport => [passport.id, passport]));
    const capacities = new Map<number, number>();
    for (const join of projectUsers) capacities.set(join.projectId, (capacities.get(join.projectId) ?? 0) + 1);
    return meets.map(meet => {
      const place = placeById.get(meet.placeId);
      const passport = passportById.get(meet.passportId);
      if (!place || !passport) throw new HttpError('Не найдены связанные данные встречи', 500);
      return { ...meet, place, passport, users: users.get(meet.id) ?? [], capacity: capacities.get(meet.projectId) ?? 0 };
    });
  }

  static async updateStatus(id: number, status: MeetStatus, passportId: number) {
    const meet = await MeetRepository.findById(id);
    if (!meet) throw new HttpError('Встреча не найдена', 404);
    if (!['pending', 'published', 'cancelled'].includes(status)) throw new HttpError('Некорректный статус встречи', 400);
    const membership = await PlacePassportRepository.findMembership(passportId, meet.placeId);
    if (meet.passportId !== passportId && membership?.role !== 'admin') throw new HttpError('Нет доступа к встрече', 403);
    return MeetRepository.updateStatus(id, status);
  }
}
