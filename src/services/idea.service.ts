import UserRepository from '../repositories/user.repository.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { generateIdeaImage, uploadImage } from './assistant/assistants/image.assistant.js';
import type {
  Passport,
  CreateIdea,
  GetIdeasQuery,
  PageMeta,
  IdeaDto, IdeaDashboard,
} from 'entities';
import type { PoolConnection } from 'mysql2/promise';
import type { CreateIdeaInput, Idea, JsonValue } from '../entities/idea.js';
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
    const values: CreateIdeaInput = {
      title: data.title, description: data.description, passportId, userId: userId ?? null,
      catalogId: data.catalogId ?? existing?.catalogId ?? null,
      cardData: cardData === null ? null : { ...cardData, name: data.title, description: data.description },
      catalogMetadata: metadata ?? existing?.catalogMetadata ?? null,
      image: data.photos === undefined ? existing?.image ?? null : data.photos.find(photo => photo.isCover)?.url ?? null,
    };
    const ideaId = existing?.id ?? await IdeaRepository.create(values, conn);
    if (existing) await IdeaRepository.update(ideaId, values, conn);
    if (data.photos !== undefined) await IdeaPhotoRepository.replace(ideaId, data.photos, conn);
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

  private static async hydrate(idea: Idea): Promise<IdeaDto> {
    const [user, photos] = await Promise.all([
      idea.userId ? UserRepository.findById(idea.userId) : null,
      IdeaPhotoRepository.findByIdeaId(idea.id),
    ]);
    return { ...idea, user, photos };
  }

  static async findAll(params: GetIdeasQuery): Promise<IdeaDto[]> {
    if (params.sort === 'nearby') {
      if (!params.latitude || !params.longitude) {
        throw new Error('Missing coordinates for nearby sort');
      }
    }

    const ideas = await IdeaRepository.findAll(params);

    return Promise.all(ideas.map(idea => this.hydrate(idea)));
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

    const imageBinary = await generateIdeaImage(idea);
    const image = await uploadImage(imageBinary);

    await IdeaRepository.update(projectId, { image });

    return idea;
  }

  static async meta(id: number | string) {
    const idea = await IdeaRepository.findById(id);
    if (!idea) throw new Error('idea.service meta: не найдена идея');

    return {
      title: idea.title,
      description: idea.description,
      ogType: 'article',
      ogTitle: idea.title,
      ogDescription: idea.description,
    } as PageMeta;
  }
}
