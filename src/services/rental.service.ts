import type { PoolConnection } from 'mysql2/promise';
import type { CreateRental, PlaceLocation, Rental, RentalDto, RentalStatus } from 'entities';
import { db } from '../utils/dbNext.js';
import { HttpError } from '../utils/http-error.js';
import { requireId } from '../utils/validation.js';
import { withinPlaceHours } from '../shared/lib/meet-time.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import { RentalRepository } from '../repositories/rental.repository.js';

export function rentalInterval(startedAt: unknown, endedAt: unknown, now = Date.now()): number {
  const valid = (value: unknown): value is string => typeof value === 'string' &&
    /(Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
  if (!valid(startedAt) || !valid(endedAt)) throw new HttpError('Укажите время с часовым поясом (МСК +03:00)', 400);
  const start = Date.parse(startedAt);
  const duration = (Date.parse(endedAt) - start) / 60000;
  if (start <= now || duration <= 0 || duration > 1440) throw new HttpError('Выберите будущий интервал продолжительностью до 24 часов', 400);
  return duration;
}

export function rentalTotal(rate: number | null, minutes: number): number | null {
  return rate === null ? null : Math.round(rate * minutes / 60 * 100) / 100;
}

export class RentalService {
  static async requireAdmin(passportId: number, placeId: number): Promise<void> {
    if ((await PlacePassportRepository.findMembership(passportId, placeId))?.role !== 'admin') throw new HttpError('Требуются права администратора этого центра', 403);
  }

  static async room(id: number, conn?: PoolConnection): Promise<PlaceLocation> {
    const [room] = await PlaceLocationRepository.findByIds([requireId(id, 'зала')], conn);
    if (!room || room.deletedAt) throw new HttpError('Зал не найден', 404);
    return room;
  }

  private static async validate(data: CreateRental, room: PlaceLocation, conn: PoolConnection): Promise<number> {
    const duration = rentalInterval(data.startedAt, data.endedAt);
    if (!room.rentalEnabled) throw new HttpError('Зал пока недоступен для аренды', 400);
    if (!Number.isSafeInteger(data.participants) || data.participants <= 0 || data.participants > 2147483647) throw new HttpError('Укажите положительное целое число участников', 400);
    if (room.capacity !== null && data.participants > room.capacity) throw new HttpError('Число участников превышает вместимость зала', 400);
    if (typeof data.comment !== 'string' || data.comment.length > 5000) throw new HttpError('Комментарий: до 5000 символов', 400);
    const schedule = await PlaceScheduleRepository.findByPlaceId(room.placeId, conn);
    if (!withinPlaceHours(data.startedAt, duration, schedule)) throw new HttpError('Весь интервал должен входить в часы работы центра (МСК)', 400);
    await this.requireFree(room.id, data.startedAt, data.endedAt, conn);
    return duration;
  }

  static async requireFree(locationId: number, startedAt: string, endedAt: string, conn: PoolConnection): Promise<void> {
    if ((await MeetRepository.roomBusy(locationId, startedAt, endedAt, conn)).length || await RentalRepository.conflicts(locationId, startedAt, endedAt, conn)) throw new HttpError('Зал занят в выбранное время', 409);
  }

  static async create(passportId: number, input: CreateRental): Promise<number> {
    if (!input || typeof input !== 'object') throw new HttpError('Заполните заявку', 400);
    const locationId = requireId(input.locationId, 'зала');
    return db.transaction(async conn => {
      await PassportRepository.lockByIds([passportId], conn);
      await PlaceLocationRepository.lockByIds([locationId], conn);
      if (!await ProjectRepository.hasProjects(passportId, conn)) throw new HttpError('Для аренды создайте хотя бы один проект', 403);
      const room = await this.room(locationId, conn);
      const minutes = await this.validate(input, room, conn);
      return RentalRepository.create({ locationId, placeId: room.placeId, passportId,
        startedAt: input.startedAt, endedAt: input.endedAt, participants: input.participants,
        comment: input.comment.trim(), hourlyRate: room.hourlyRate, estimatedTotal: rentalTotal(room.hourlyRate, minutes) }, conn);
    }, true);
  }

  static async changeStatus(id: number, passportId: number, status: RentalStatus, reason: unknown, placeId?: number): Promise<void> {
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) throw new HttpError('Некорректный статус', 400);
    const existing = await RentalRepository.findById(id);
    if (!existing) throw new HttpError('Заявка не найдена', 404);
    if (status === 'cancelled') {
      if (existing.passportId !== passportId) throw new HttpError('Нельзя отменить чужую заявку', 403);
    } else {
      if (placeId !== existing.placeId) throw new HttpError('Заявка другого центра', 403);
      await this.requireAdmin(passportId, existing.placeId);
    }
    const rejectionReason = status === 'rejected' && typeof reason === 'string' ? reason.trim() : null;
    if (status === 'rejected' && (!rejectionReason || rejectionReason.length > 5000)) throw new HttpError('Укажите причину отклонения (до 5000 символов)', 400);
    await db.transaction(async conn => {
      await PassportRepository.lockByIds([existing.passportId], conn);
      await PlaceLocationRepository.lockByIds([existing.locationId], conn);
      const current = await RentalRepository.findById(id, conn);
      if (!current) throw new HttpError('Заявка не найдена', 404);
      if (status !== 'rejected' && Date.parse(current.startedAt) <= Date.now()) throw new HttpError('Время начала уже наступило', 409);
      if (status === 'cancelled' ? !['pending', 'confirmed'].includes(current.status) : current.status !== 'pending') throw new HttpError('Статус заявки уже изменён', 409);
      if (status === 'confirmed') await this.validate(current, await this.room(current.locationId, conn), conn);
      await RentalRepository.setStatus(id, status, rejectionReason, conn);
    }, true);
  }

  static async list(passportId: number, placeId?: number): Promise<RentalDto[]> {
    if (placeId !== undefined) await this.requireAdmin(passportId, placeId);
    return this.hydrate(await RentalRepository.list(placeId === undefined ? 'passportId' : 'placeId', placeId ?? passportId));
  }

  private static async hydrate(rows: Rental[]): Promise<RentalDto[]> {
    const [rooms, places, passports] = await Promise.all([
      PlaceLocationRepository.findByIds(rows.map(row => row.locationId)),
      PlaceRepository.findByIds(rows.map(row => row.placeId)), PassportRepository.findByIds(rows.map(row => row.passportId)),
    ]);
    return rows.map(row => {
      const applicant = passports.find(passport => passport.id === row.passportId);
      return { ...row, locationTitle: rooms.find(room => room.id === row.locationId)?.title ?? 'Зал',
        placeTitle: places.find(place => place.id === row.placeId)?.title ?? 'Центр',
        applicant: { id: row.passportId, title: applicant?.title ?? 'Преподаватель', description: applicant?.description ?? null, image: applicant?.image } };
    });
  }

  static async busy(locationId: number, date: unknown) {
    await this.room(locationId);
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T00:00:00+03:00`)) || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date) throw new HttpError('Укажите день в формате YYYY-MM-DD', 400);
    const start = `${date}T00:00:00+03:00`;
    const end = new Date(Date.parse(start) + 86400000).toISOString();
    const [meets, rentals] = await Promise.all([MeetRepository.roomBusy(locationId, start, end), RentalRepository.busy(locationId, start, end)]);
    return [...meets, ...rentals].sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }
}
