import PlaceRepository from '../repositories/place.repository.js';
import MeetRepository from '../repositories/meet.repository.js';

export class PlaceService {
  static async findAll() {
    const places = await PlaceRepository.findAll();

    const meetsForPlaces = await Promise.all(places.map(place => MeetRepository.findByPlaceId(place.id)));

    return places.map((place, idx) => ({
      ...place,
      meets: meetsForPlaces[idx],
    }));
  }

  static async create(data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error('EMPTY_PLACE');
    }

    return PlaceRepository.create(data);
  }
}
