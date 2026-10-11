import type { Passport, CreateMeet, GetMeetsQuery, MeetDto, MeetStatus, UpdateMeetInput, Meet } from 'entities';
import ProjectRepository from '../repositories/project.repository.js';
import MeetRepository from '../repositories/meet.repository.js';
import PlaceRepository from '../repositories/place.repository.js';
import PassportRepository from '../repositories/passport.repository.js';
import ProjectUserRepository from '../repositories/project-user.repository.js';
import { ParticipantsService } from './participants.service.js';
import { HttpError } from '../utils/http-error.js';
import PlacePassportRepository from '../repositories/place-passport.repository.js';
import PaymentRepository from '../repositories/payment.repository.js';
import PlaceLocationRepository from '../repositories/place-location.repository.js';
import PlaceScheduleRepository from '../repositories/place-schedule.repository.js';
import MeetUserRepository from '../repositories/meet-user.repository.js';
import { db } from '../utils/dbNext.js';
import { requireId } from '../utils/validation.js';
import { withinPlaceHours } from '../shared/lib/meet-time.js';
import type { PoolConnection } from 'mysql2/promise';

export class MeetService {
  private static limit(value: unknown): number {
    if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0 || value > 2147483647) {
      throw new HttpError('Число мест должно быть положительным целым числом', 400);
    }
    return value;
  }

  private static start(value: string): string {
    if (typeof value !== 'string' || !/(Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) {
      throw new HttpError('Укажите дату и время с часовым поясом (МСК +03:00)', 400);
    }
    return new Date(Date.parse(value) + 3 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
  }

  private static async location(placeId: number, value: number | null, conn?: PoolConnection): Promise<number | null> {
    if (value === null) return null;
    const id = requireId(value, 'зала');
    const [location] = await PlaceLocationRepository.findByIds([id], conn);
    if (!location || location.deletedAt || location.placeId !== placeId) {
      throw new HttpError('Выберите активный зал этого центра', 400);
    }
    return id;
  }

  private static async access(meet: Meet, passportId: number, activePlaceId?: number): Promise<boolean> {
    if (activePlaceId !== undefined) {
      const membership = await PlacePassportRepository.findMembership(passportId, activePlaceId);
      if (membership?.role !== 'admin' || meet.placeId !== activePlaceId) throw new HttpError('Нет доступа к встрече этого центра', 403);
      return true;
    }
    if (meet.passportId !== passportId) throw new HttpError('Нет доступа к встрече', 403);
    return false;
  }

  private static async validateSlot(meet: Meet, conn: PoolConnection): Promise<void> {
    if (meet.duration !== null && (!Number.isSafeInteger(meet.duration) || meet.duration <= 0 || meet.duration > 1440)) {
      throw new HttpError('Укажите положительную длительность в минутах', 400);
    }
    const schedule = await PlaceScheduleRepository.findByPlaceId(meet.placeId, conn);
    if (!withinPlaceHours(meet.startedAt, meet.duration, schedule)) throw new HttpError('Весь интервал встречи должен входить в часы работы центра (МСК)', 400);
    if (meet.status === 'cancelled') return;
    const conflict = await MeetRepository.findConflict({ ...meet, startedAt: this.start(meet.startedAt) }, conn);
    if (conflict) throw new HttpError(conflict.passportId === meet.passportId
      ? 'Преподаватель занят другой встречей в это время'
      : 'Выбранный зал занят другой встречей в это время', 409);
  }

  static async create(passport: Passport, data: CreateMeet) {
    if (!passport) throw new HttpError('UNAUTHORIZED', 401);
    const project = await ProjectRepository.findById(data.projectId);

    if (!project) throw new HttpError('Проект не найден', 404);
    if (project.passportId !== passport.id) throw new HttpError('Нет доступа к проекту', 403);

    const maxParticipants = this.limit(data.maxParticipants);
    this.start(data.startedAt);
    const [projectLocation] = await PlaceLocationRepository.findByIds(project.locationId ? [project.locationId] : []);
    const defaultLocation = projectLocation && !projectLocation.deletedAt && projectLocation.placeId === project.placeId ? projectLocation.id : null;
    const locationId = await this.location(project.placeId, data.locationId === undefined ? defaultLocation : data.locationId);
    return db.transaction(async conn => {
      await PassportRepository.lockByIds([passport.id], conn);
      await PlaceLocationRepository.lockByIds(locationId === null ? [] : [locationId], conn);
      await this.location(project.placeId, locationId, conn);
      const meet: Meet = { id: 0, projectId: project.id, passportId: passport.id, placeId: project.placeId,
        price: data.price, duration: data.duration, startedAt: data.startedAt, locationId, maxParticipants,
        status: 'pending', deletedAt: null };
      await this.validateSlot(meet, conn);
      return MeetRepository.create({ ...meet, startedAt: this.start(meet.startedAt) }, conn);
    }, true);
  }

  static async update(data: { id: number } & UpdateMeetInput, passportId: number, activePlaceId?: number) {
    const { id, ...fields } = data;

    const existingMeet = await MeetRepository.findById(id);
    if (!existingMeet) {
      throw new HttpError('Встреча не найдена', 404);
    }
    const admin = await this.access(existingMeet, passportId, activePlaceId);
    return db.transaction(async conn => {
      await PassportRepository.lockByIds([existingMeet.passportId], conn);
      const current = await MeetRepository.findById(id, conn, false);
      if (!current || current.deletedAt) throw new HttpError('Встреча не найдена', 404);
      const locationId = fields.locationId === undefined ? current.locationId : await this.location(current.placeId, fields.locationId, conn);
      await PlaceLocationRepository.lockByIds([current.locationId, locationId].filter((id): id is number => id !== null), conn);
      await MeetRepository.findById(id, conn);
      if (fields.locationId !== undefined) await this.location(current.placeId, locationId, conn);
      const updateData: UpdateMeetInput = { startedAt: fields.startedAt, duration: fields.duration, price: fields.price,
        locationId: fields.locationId, maxParticipants: fields.maxParticipants };
      if (fields.maxParticipants !== undefined) {
        if (fields.maxParticipants === null && current.maxParticipants !== null) throw new HttpError('Установленный лимит нельзя очистить', 400);
        if (fields.maxParticipants !== null) {
          const limit = this.limit(fields.maxParticipants);
          const participants = await MeetUserRepository.findParticipants(id, conn);
          if (limit < participants.length) throw new HttpError('Число мест не может быть меньше числа записанных учеников', 409);
        }
      }
      if (fields.startedAt !== undefined) this.start(fields.startedAt);
      const candidate: Meet = { ...current, startedAt: fields.startedAt ?? current.startedAt,
        duration: fields.duration === undefined ? current.duration : fields.duration, locationId };
      const slotChanged = new Date(candidate.startedAt).getTime() !== new Date(current.startedAt).getTime() ||
        candidate.duration !== current.duration || candidate.locationId !== current.locationId;
      if (slotChanged) {
        if (!admin) updateData.status = 'pending';
        await this.validateSlot({ ...candidate, status: updateData.status ?? current.status }, conn);
      }
      if (fields.startedAt !== undefined) updateData.startedAt = this.start(fields.startedAt);
      return MeetRepository.update(id, updateData, conn);
    }, true);
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
    const meets = await this.hydrateAll(await MeetRepository.findAll(data));
    if (!data.userId || !meets.length) return meets;
    const paidIds = new Set(await PaymentRepository.findPaidMeetIdsByUser(data.userId, meets.map(meet => meet.id)));
    return meets.map(meet => ({ ...meet, isPaid: paidIds.has(meet.id) }));
  }

  static async hydrateAll(meets: Meet[]): Promise<MeetDto[]> {
    const meetUsers = await MeetUserRepository.findByMeetIds(meets.map(meet => meet.id));
    const participantCounts = new Map<number, number>();
    for (const join of meetUsers) participantCounts.set(join.meetId, (participantCounts.get(join.meetId) ?? 0) + 1);
    const [places, passports, users, projectUsers, projects, locations] = await Promise.all([
      PlaceRepository.findByIds(meets.map(meet => meet.placeId)),
      PassportRepository.findByIds(meets.map(meet => meet.passportId)),
      ParticipantsService.forMeets(meets.map(meet => meet.id), meetUsers),
      ProjectUserRepository.findByProjectIds(meets.map(meet => meet.projectId)),
      ProjectRepository.findByIds(meets.map(meet => meet.projectId)),
      PlaceLocationRepository.findByIds(meets.flatMap(meet => meet.locationId ? [meet.locationId] : [])),
    ]);
    const placeById = new Map(places.map(place => [place.id, place]));
    const passportById = new Map(passports.map(passport => [passport.id, passport]));
    const capacities = new Map<number, number>();
    const projectById = new Map(projects.map(project => [project.id, project]));
    const locationById = new Map(locations.map(location => [location.id, location]));
    for (const join of projectUsers) capacities.set(join.projectId, (capacities.get(join.projectId) ?? 0) + 1);
    return meets.map(meet => {
      const place = placeById.get(meet.placeId);
      const passport = passportById.get(meet.passportId);
      if (!place || !passport) throw new HttpError('Не найдены связанные данные встречи', 500);
      const project = projectById.get(meet.projectId);
      const location = meet.locationId ? locationById.get(meet.locationId) : undefined;
      return { ...meet, place, passport, projectTitle: project?.title ?? null, projectImage: project?.image ?? null,
        location: location?.placeId === meet.placeId ? { id: location.id, title: location.title } : null,
        users: users.get(meet.id) ?? [], participantCount: participantCounts.get(meet.id) ?? 0, capacity: capacities.get(meet.projectId) ?? 0 };
    });
  }

  static async updateStatus(id: number, status: MeetStatus, passportId: number, activePlaceId?: number) {
    const meet = await MeetRepository.findById(id);
    if (!meet) throw new HttpError('Встреча не найдена', 404);
    if (!['pending', 'published', 'cancelled'].includes(status)) throw new HttpError('Некорректный статус встречи', 400);
    const admin = await this.access(meet, passportId, activePlaceId);
    if (!admin) throw new HttpError('Подтверждать и отклонять заявки может администратор активного центра', 403);
    return db.transaction(async conn => {
      await PassportRepository.lockByIds([meet.passportId], conn);
      const current = await MeetRepository.findById(id, conn, false);
      if (!current || current.deletedAt) throw new HttpError('Встреча не найдена', 404);
      await PlaceLocationRepository.lockByIds(current.locationId === null ? [] : [current.locationId], conn);
      await MeetRepository.findById(id, conn);
      if (status !== 'cancelled') {
        await this.location(current.placeId, current.locationId, conn);
        await this.validateSlot({ ...current, status }, conn);
      }
      return MeetRepository.update(id, { status }, conn);
    }, true);
  }
}
