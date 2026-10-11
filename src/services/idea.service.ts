import { HttpError } from '../utils/http-error.js';
import UserRepository from '../repositories/user.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { generateIdeaImage } from './assistant/assistants/image.assistant.js';
import type {
  Passport,
  CreateIdea,
  GetIdeasQuery,
  PageMeta,
  IdeaDto, IdeaDashboard,
} from 'entities';
import type { PoolConnection } from 'mysql2/promise';
import type { CreateIdeaInput, Idea, IdeaPhoto, JsonValue } from '../entities/idea.js';
import { FileService } from './file.service.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import { db } from '../utils/dbNext.js';
import { IdeaError, validateIdea, validateIdeaCatalog } from './idea.validation.js';
import { ProjectService } from './project.service.js';

export class IdeaService {
  static async create(passport: Passport, input: unknown, userId?: number): Promise<number> {
    if (!passport) throw new IdeaError('Authentication required', 401);
    const data = validateIdea(input);
    return db.transaction(conn => this.save(data, passport.id, 'create', conn, undefined, userId));
  }

  static async update(passport: Passport, id: number | string, input: unknown): Promise<IdeaDto> {
    if (!passport) throw new IdeaError('Authentication required', 401);
    const data = validateIdea(input);
    const ideaId = await db.transaction(conn => this.save(data, passport.id, 'update', conn, id));
    return (await this.findById(ideaId))!;
  }

  private static async save(data: CreateIdea, passportId: number | null, mode: 'create' | 'update' | 'import',
    conn: PoolConnection, id?: number | string, userId?: number, metadata?: Record<string, JsonValue>): Promise<number> {
    const lookup = id ?? data.catalogId;
    const existing = lookup === undefined ? null : await IdeaRepository.findById(lookup, conn);
    if (mode === 'create' && existing) throw new IdeaError('Idea ID already exists', 409);
    if (mode === 'update' && !existing) throw new IdeaError('Idea not found', 404);
    if (existing && existing.passportId !== null && existing.passportId !== passportId) throw new IdeaError('Only the owner can update this idea', 403);
    if (existing && data.catalogId !== undefined && existing.catalogId !== data.catalogId) throw new IdeaError('Stable ID cannot change', 400);
    const cardData = data.cardData === undefined ? existing?.cardData ?? null : data.cardData;
    let photos = data.photos;
    if (mode === 'import' && existing && photos) {
      const storedPhotos = await IdeaPhotoRepository.findByIdeaId(existing.id, conn);
      photos = photos.map(photo => {
        const stored = storedPhotos.find(old => old.id === photo.id && old.driveFileId === photo.driveFileId
          && old.sourceUrl === photo.url && FileService.isStorageUrl(old.url));
        return stored ? { ...photo, url: stored.url, sourceUrl: photo.url } : photo;
      });
    }
    const values: CreateIdeaInput = {
      title: data.title, description: data.description, passportId, userId: userId ?? null,
      catalogId: data.catalogId ?? existing?.catalogId ?? null,
      cardData: cardData === null ? null : { ...cardData, name: data.title, description: data.description },
      catalogMetadata: metadata ?? existing?.catalogMetadata ?? null,
      image: photos === undefined ? existing?.image ?? null : photos.find(photo => photo.isCover)?.url ?? null,
    };
    const ideaId = existing?.id ?? await IdeaRepository.create(values, conn);
    if (existing) await IdeaRepository.update(ideaId, values, conn);
    if (photos !== undefined) await IdeaPhotoRepository.replace(ideaId, photos, conn);
    return ideaId;
  }

  static async importCatalog(input: unknown, passportId: number | null): Promise<{ ideas: number; photos: number }> {
    const { items, ...metadata } = validateIdeaCatalog(input);
    await db.transaction(async conn => {
      for (const item of items) {
        const { photos, ...cardData } = item;
        await this.save({ title: item.name, description: item.description, catalogId: item.id, cardData, photos },
          passportId, 'import', conn, undefined, undefined, metadata);
      }
    });
    return { ideas: items.length, photos: items.reduce((count, item) => count + item.photos.length, 0) };
  }

  private static async hydrateAll(ideas: Idea[]): Promise<IdeaDto[]> {
    const [users, rows] = await Promise.all([
      UserRepository.findByIds(ideas.flatMap(idea => idea.userId ? [idea.userId] : [])),
      IdeaPhotoRepository.findByIdeaIds(ideas.map(idea => idea.id)),
    ]);
    const userById = new Map(users.map(user => [user.id, user]));
    const photosByIdea = new Map<number, IdeaPhoto[]>();
    for (const row of rows) {
      const group = photosByIdea.get(row.ideaId) ?? [];
      group.push(typeof row.photoData === 'string' ? JSON.parse(row.photoData) as IdeaPhoto : row.photoData);
      photosByIdea.set(row.ideaId, group);
    }
    return ideas.map(idea => ({ ...idea, user: userById.get(idea.userId) ?? null, photos: photosByIdea.get(idea.id) ?? [] }));
  }

  static async findByIds(ids: number[]): Promise<IdeaDto[]> {
    return this.hydrateAll(await IdeaRepository.findByIds(ids));
  }

  private static async hydrate(idea: Idea): Promise<IdeaDto> {
    const [user, photos] = await Promise.all([
      idea.userId ? UserRepository.findById(idea.userId) : null,
      IdeaPhotoRepository.findByIdeaId(idea.id),
    ]);
    return { ...idea, user, photos };
  }

  /** Operator migration; no unauthenticated HTTP endpoint is exposed. */
  static async uploadCatalogPhotos(catalogId: string, readPhoto: (photo: IdeaPhoto) => Promise<Buffer>): Promise<number> {
    const idea = await this.findById(catalogId);
    if (!idea) throw new IdeaError('Idea not found', 404);
    if (idea.passportId !== null) throw new IdeaError('Operator migration only handles shared catalog ideas', 403);
    let uploaded = 0;
    const photos: IdeaPhoto[] = [];
    for (const photo of idea.photos) {
      if (FileService.isStorageUrl(photo.url)) { photos.push(photo); continue; }
      if (typeof photo.driveFileId !== 'string') throw new IdeaError('Catalog photo has no Drive ID', 400);
      const buffer = await readPhoto(photo);
      const key = `ideas/${encodeURIComponent(catalogId)}/${encodeURIComponent(photo.id)}-${encodeURIComponent(photo.driveFileId)}.jpg`;
      const url = await FileService.uploadBuffer(buffer, photo.fileName, 'image/jpeg', key);
      photos.push({ ...photo, sourceUrl: photo.url, url });
      uploaded++;
    }
    await db.transaction(async conn => {
      const current = await IdeaRepository.findById(idea.id, conn);
      const currentPhotos = await IdeaPhotoRepository.findByIdeaId(idea.id, conn);
      if (!current || current.passportId !== null || JSON.stringify(currentPhotos) !== JSON.stringify(idea.photos)) {
        throw new IdeaError('Idea changed during photo upload; retry the migration', 409);
      }
      await IdeaPhotoRepository.replace(idea.id, photos, conn);
      await IdeaRepository.update(idea.id, { image: photos.find(photo => photo.isCover)?.url ?? null }, conn);
    });
    return uploaded;
  }

  static async findAll(params: GetIdeasQuery): Promise<IdeaDto[]> {
    if (params.sort === 'nearby') {
      if (params.latitude === undefined || params.longitude === undefined) {
        params = { ...params, sort: 'new', latitude: undefined, longitude: undefined };
      } else {
        const latitude = Number(params.latitude);
        const longitude = Number(params.longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
          throw new IdeaError('Некорректные координаты', 400);
        }
        params = { ...params, latitude, longitude };
      }
    }

    const ideas = await IdeaRepository.findAll(params);

    return this.hydrateAll(ideas);
  }

  static async findById(id: number | string): Promise<IdeaDto | null> {
    const idea = await IdeaRepository.findById(id);
    return idea ? this.hydrate(idea) : null;
  }

  static async findByIdDashboard(id: number | string): Promise<IdeaDashboard | null> {
    const idea = await this.findById(id);
    if (!idea) return null;
    const projects = await ProjectService.findAll({ ideaId: idea.id });
    return {
      ...idea,
      projects,
    };
  }

  static async generateIdeaImage(projectId: number) {
    const idea = await IdeaRepository.findById(projectId);
    if (!idea) return null;

    const imageBinary: unknown = await generateIdeaImage(idea);
    if (!(typeof imageBinary === 'string' || imageBinary instanceof Uint8Array)) {
      throw new IdeaError('Генератор не вернул изображение', 502);
    }
    const buffer = typeof imageBinary === 'string' ? Buffer.from(imageBinary, 'binary') : Buffer.from(imageBinary);
    const image = await FileService.uploadBuffer(buffer, 'idea.jpg', 'image/jpeg');

    await IdeaRepository.update(projectId, { image });

    return idea;
  }

  static async meta(id: number | string) {
    const idea = await IdeaRepository.findById(id);
    if (!idea) throw new HttpError('idea.service meta: не найдена идея', 404);

    return {
      title: idea.title,
      description: idea.description,
      ogType: 'article',
      ogTitle: idea.title,
      ogDescription: idea.description,
    } as PageMeta;
  }
}
