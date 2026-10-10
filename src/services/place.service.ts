import { HttpError } from '../utils/http-error.js';
import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import type { CreatePlace, PlaceDashboardDto, PlaceDto, PlaceUpdateDto } from 'entities';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import { MeetService } from './meet.service.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { db } from '../utils/dbNext.js';

export class PlaceService {
  static async findAll() {
    const places = await PlaceRepository.findAll();

    const meetsForPlaces = await Promise.all(places.map(place => MeetRepository.findByPlaceId(place.id)));

    return places.map((place, idx) => ({
      ...place,
      meets: meetsForPlaces[idx],
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

    const meets = await MeetRepository.findAll({ placeId: id });

    return {
      place: { ...place, schedule: await PlaceScheduleRepository.findByPlaceId(id) },
      stats: {
        teachers: 5,
        projects: 12,
        users: 86,
        meets: 7,
        pendingPlaceCount: meets.filter(meet => meet.status === 'pending').length,
        incoming: 210000,
      },
    };
  }
}
