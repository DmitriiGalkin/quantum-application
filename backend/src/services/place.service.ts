import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { CreatePlace, PlaceFullDto, PlaceUpdateDto } from '@shared/types';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';

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
      throw new Error('EMPTY_PLACE');
    }

    const placeId = await PlaceRepository.create({ ...data });
    const placePassportId = await PlacePassportRepository.create({ placeId, passportId, role: 'admin' as const });

    return placeId;
  }

  static async update(data: PlaceUpdateDto) {
    const { schedule, ...place } = data;
    await PlaceRepository.update(data.id, place);

    if (schedule) {
      console.log('schedule', schedule);
      await PlaceScheduleRepository.replace(data.id, schedule);
    }

    return PlaceRepository.findById(data.id);
  }

  static async findById(id: number): Promise<PlaceFullDto | null> {
    const place = await PlaceRepository.findById(id);
    if (!place) return null;

    const meets = await MeetRepository.findAll({ placeId: id });

    const schedule = await PlaceScheduleRepository.findByPlaceId(id);

    console.log(meets, 'meets');
    return { ...place, meets, schedule };
  }
}
