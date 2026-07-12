import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { CreatePlace, type MeetExtendedDto, PlaceFullDto } from '@shared/types';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import { Place } from '../entities/place.js';
import UserRepository from '../repositories/user.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import { Passport } from '../entities/passport.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';

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

  static async findById(id: number): Promise<PlaceFullDto | null> {
    const place = await PlaceRepository.findById(id);
    if (!place) return null;

    return { ...place, meets: [] };
  }
}
