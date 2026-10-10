import type { PoolConnection } from 'mysql2/promise';
import type { IdeaCard, IdeaCardInput, IdeaCardModel, IdeaCardRow, JsonValue } from '../entities/idea-card.js';
import { IdeaCardRepository } from '../repositories/idea-card.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import { db } from '../utils/dbNext.js';
import { IdeaCardError, validateIdeaCard, validateIdeaCatalog } from './idea-card.validation.js';

function model(card: IdeaCardInput, passportId: number | null, metadata: Record<string, JsonValue> | null): IdeaCardModel {
  const { photos, ...cardData } = card;
  return { catalogId: card.id, title: card.name, description: card.description,
    image: photos.find(photo => photo.isCover)?.url ?? null, cardData, catalogMetadata: metadata, passportId };
}

function metadata(row: IdeaCardRow): Record<string, JsonValue> | null {
  return typeof row.catalogMetadata === 'string' ? JSON.parse(row.catalogMetadata) as Record<string, JsonValue> : row.catalogMetadata;
}

export class IdeaCardService {
  private static async hydrate(row: IdeaCardRow): Promise<IdeaCard> {
    const data = typeof row.cardData === 'string' ? JSON.parse(row.cardData) as Record<string, JsonValue> : row.cardData;
    return { ...data, id: row.catalogId, ideaId: row.id,
      photos: await IdeaPhotoRepository.findByIdeaId(row.id) } as IdeaCard;
  }

  static async findAll(): Promise<IdeaCard[]> {
    return Promise.all((await IdeaCardRepository.findAll()).map(row => this.hydrate(row)));
  }

  static async findById(id: string): Promise<IdeaCard | null> {
    const row = await IdeaCardRepository.findById(id);
    return row ? this.hydrate(row) : null;
  }

  private static async save(card: IdeaCardInput, passportId: number | null, mode: 'create' | 'update' | 'import',
    catalogMetadata: Record<string, JsonValue> | null, conn: PoolConnection): Promise<number> {
    const existing = await IdeaCardRepository.findById(card.id, conn);
    if (mode === 'create' && existing) throw new IdeaCardError('Idea ID already exists', 409);
    if (mode === 'update' && !existing) throw new IdeaCardError('Idea not found', 404);
    if (existing?.passportId !== null && existing && existing.passportId !== passportId) {
      throw new IdeaCardError('Only the owner can update this idea', 403);
    }
    const data = model(card, passportId, mode === 'update' && existing ? metadata(existing) : catalogMetadata);
    const ideaId = existing?.id ?? await IdeaCardRepository.create(data, conn);
    if (existing) await IdeaCardRepository.update(ideaId, data, conn);
    await IdeaPhotoRepository.replace(ideaId, card.photos, conn);
    return ideaId;
  }

  static async write(input: unknown, passportId: number, mode: 'create' | 'update', expectedId?: string): Promise<IdeaCard> {
    const card = validateIdeaCard(input);
    if (expectedId !== undefined && card.id !== expectedId) throw new IdeaCardError('Stable ID cannot change', 400);
    await db.transaction(conn => this.save(card, passportId, mode, null, conn));
    return (await this.findById(card.id))!;
  }

  /** CLI imports have no invented owner; HTTP imports use the authenticated passport. */
  static async import(input: unknown, passportId: number | null): Promise<{ ideas: number; photos: number }> {
    const { items, ...catalogMetadata } = validateIdeaCatalog(input);
    await db.transaction(async conn => {
      for (const card of items) await this.save(card, passportId, 'import', catalogMetadata, conn);
    });
    return { ideas: items.length, photos: items.reduce((count, card) => count + card.photos.length, 0) };
  }
}
