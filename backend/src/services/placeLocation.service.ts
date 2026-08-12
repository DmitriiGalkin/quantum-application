import PlaceLocationRepository from '../repositories/place-location.repository.js';
import { CreateLocation } from '@shared/types';

class PlaceLocationService {
  static async create(placeId: number, body: CreateLocation) {
    return PlaceLocationRepository.create({
      placeId,
      ...body,
    });
  }

  static async findAll(placeId: number) {
    // TODO: проверить доступ к place
    return PlaceLocationRepository.findLocations(placeId);
  }

  static async delete(id: number) {
    // TODO: проверить доступ
    return PlaceLocationRepository.delete(id);
  }
}

export default PlaceLocationService;
