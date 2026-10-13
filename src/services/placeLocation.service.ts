import PlaceLocationRepository from '../repositories/place-location.repository.js';
import type { CreateLocation, RoomDto, UpdateLocation } from 'entities';
import { LocationPhotoRepository } from '../repositories/location-photo.repository.js';
import { RentalRepository } from '../repositories/rental.repository.js';
import { RentalService } from './rental.service.js';
import { FileService } from './file.service.js';
import { db } from '../utils/dbNext.js';
import { HttpError } from '../utils/http-error.js';

class PlaceLocationService {
  static async create(placeId: number, body: CreateLocation, passportId: number) {
    await RentalService.requireAdmin(passportId, placeId);
    if (typeof body?.title !== 'string' || !body.title.trim() || body.title.length > 255) throw new HttpError('Укажите название зала (до 255 символов)', 400);
    return PlaceLocationRepository.create({
      placeId,
      title: body.title.trim(),
    });
  }

  static async findAll(placeId: number): Promise<RoomDto[]> {
    const rooms = (await PlaceLocationRepository.findLocations(placeId)).filter(room => !room.deletedAt);
    const photos = await LocationPhotoRepository.findByLocationIds(rooms.map(room => room.id));
    return rooms.map(room => ({ ...room, photos: photos.filter(photo => photo.locationId === room.id) }));
  }

  static async update(id: number, placeId: number, passportId: number, input: UpdateLocation): Promise<void> {
    await RentalService.requireAdmin(passportId, placeId);
    if (!input || typeof input.title !== 'string' || !input.title.trim() || input.title.length > 255 ||
      (input.description !== null && (typeof input.description !== 'string' || input.description.length > 10000)) ||
      (input.capacity !== null && (!Number.isSafeInteger(input.capacity) || input.capacity <= 0 || input.capacity > 2147483647)) ||
      (input.hourlyRate !== null && (typeof input.hourlyRate !== 'number' || !Number.isFinite(input.hourlyRate) || input.hourlyRate < 0 || input.hourlyRate > 99999999.99 || Math.abs(input.hourlyRate * 100 - Math.round(input.hourlyRate * 100)) > 0.00001)) ||
      typeof input.rentalEnabled !== 'boolean') throw new HttpError('Проверьте название, описание, вместимость и ставку аренды', 400);
    if (!Array.isArray(input.photoUrls) || input.photoUrls.length > 10 || new Set(input.photoUrls).size !== input.photoUrls.length ||
      input.photoUrls.some(url => typeof url !== 'string' || url.length > 2048 || !FileService.isStorageUrl(url) || !/\.(jpe?g|png|webp)$/i.test(url))) throw new HttpError('До 10 разных фотографий JPEG, PNG или WebP, загруженных через сервис', 400);
    await db.transaction(async conn => {
      await PlaceLocationRepository.lockByIds([id], conn);
      const room = await RentalService.room(id, conn);
      if (room.placeId !== placeId) throw new HttpError('Зал другого центра', 403);
      await PlaceLocationRepository.update(id, { title: input.title.trim(), description: input.description?.trim() || null,
        capacity: input.capacity, hourlyRate: input.hourlyRate, rentalEnabled: input.rentalEnabled }, conn);
      await LocationPhotoRepository.replace(id, input.photoUrls, conn);
    }, true);
  }

  static async delete(id: number, placeId: number, passportId: number) {
    await RentalService.requireAdmin(passportId, placeId);
    await db.transaction(async conn => {
      await PlaceLocationRepository.lockByIds([id], conn);
      if ((await RentalService.room(id, conn)).placeId !== placeId) throw new HttpError('Зал другого центра', 403);
      if (await RentalRepository.hasFutureActive(id, conn)) throw new HttpError('Сначала отмените или отклоните активные заявки на аренду', 409);
      await PlaceLocationRepository.delete(id, conn);
    }, true);
  }
}

export default PlaceLocationService;
