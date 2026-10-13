import { HttpError } from '../utils/http-error.js';
import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import type { CreatePlace, PlaceDashboardDto, PlaceDto, PlaceUpdateDto } from 'entities';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import { MeetService } from './meet.service.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { db } from '../utils/dbNext.js';
import ProjectRepository from '../repositories/project.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import UserRepository from '../repositories/user.repository.js';

export class PlaceService {
  static async findAll() {
    const places = await PlaceRepository.findAll();

    const meets = await MeetRepository.findByPlaceIds(places.map(place => place.id));
    const meetsByPlace = new Map<number, typeof meets>();
    for (const meet of meets) {
      const group = meetsByPlace.get(meet.placeId) ?? [];
      group.push(meet);
      meetsByPlace.set(meet.placeId, group);
    }

    return places.map(place => ({
      ...place,
      meets: meetsByPlace.get(place.id) ?? [],
    }));
  }

  static async create(passportId: number, data: CreatePlace) {
    if (!data || Object.keys(data).length === 0) {
      throw new HttpError('EMPTY_PLACE', 400);
    }

    return db.transaction(async conn => {
      const placeId = await PlaceRepository.create(data, conn);
      await PlacePassportRepository.create({ placeId, passportId, role: 'admin' }, conn);
      if (data.schedule) await PlaceScheduleRepository.replace(placeId, data.schedule, conn);
      return placeId;
    });
  }

  static async update(data: PlaceUpdateDto) {
    if (data.phone !== undefined && data.phone !== null && (typeof data.phone !== 'string' || data.phone.length > 255)) throw new HttpError('Телефон: до 255 символов', 400);
    const { schedule, ...place } = data;
    await db.transaction(async conn => {
      await PlaceRepository.update(data.id, place, conn);
      if (schedule) await PlaceScheduleRepository.replace(data.id, schedule, conn);
    });

    return PlaceRepository.findById(data.id);
  }

  static async findById(id: number): Promise<PlaceDto | null> {
    const place = await PlaceRepository.findById(id);
    if (!place) return null;

    const meets = await MeetService.findAll({ placeId: id });

    const schedule = await PlaceScheduleRepository.findByPlaceId(id);

    return { ...place, meets, schedule };
  }

  static async getDashboard(id: number): Promise<PlaceDashboardDto> {
    const place = await PlaceRepository.findById(id);
    if (!place) throw new HttpError('Центр не найден', 404);

    const [projectIds, meetIds, teachers, meetStats, schedule] = await Promise.all([
      ProjectRepository.findIdsByPlaceId(id),
      MeetRepository.findIdsByPlaceId(id),
      PlacePassportRepository.countTeachers(id),
      MeetRepository.getPlaceStats(id),
      PlaceScheduleRepository.findByPlaceId(id),
    ]);
    const [projectUsers, meetUsers] = await Promise.all([
      ProjectUserRepository.findByProjectIds(projectIds),
      MeetUserRepository.findByMeetIds(meetIds),
    ]);
    const userIds = [...new Set([...projectUsers, ...meetUsers].map(join => join.userId))];
    const users = await UserRepository.findByIds(userIds, true);

    return {
      place: { ...place, schedule },
      stats: {
        teachers,
        projects: projectIds.length,
        users: users.length,
        ...meetStats,
        incoming: null,
      },
    };
  }
}
