import type { IdeaCardInput, IdeaCatalog, JsonValue } from '../entities/idea-card.js';

export class IdeaCardError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function invalid(message: string): never { throw new IdeaCardError(message, 400); }

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function json(value: unknown): value is JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(json);
  return object(value) && Object.values(value).every(json);
}

function id(value: unknown): void {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(value)) invalid('Invalid stable ID');
}

export function validateIdeaCard(value: unknown): IdeaCardInput {
  if (!object(value) || !json(value)) invalid('Expected a JSON object');
  id(value.id);
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 255) invalid('Invalid name');
  if (typeof value.description !== 'string') invalid('Invalid description');
  if (new TextEncoder().encode(value.description).length > 65535) invalid('Description exceeds MySQL TEXT capacity');
  if (!Array.isArray(value.photos)) invalid('photos must be an array');
  const ids = new Set<string>();
  let covers = 0;
  for (const photo of value.photos) {
    if (!object(photo)) invalid('Invalid photo');
    id(photo.id);
    for (const field of ['fileName', 'driveFileId', 'url']) {
      if (typeof photo[field] !== 'string' || !photo[field]) invalid(`Invalid photo ${field}`);
    }
    let url: URL;
    try { url = new URL(photo.url as string); } catch { invalid('Invalid photo URL'); }
    if (!['https:', 'http:'].includes(url.protocol)) invalid('Photo URL must use HTTP(S)');
    if (typeof photo.isCover !== 'boolean') invalid('isCover must be boolean');
    if (photo.isCover) covers++;
    if (ids.has(photo.id as string)) invalid('Duplicate photo ID');
    ids.add(photo.id as string);
  }
  if (covers > 1) invalid('Only one cover is allowed');
  const cover = value.photos.find(photo => object(photo) && photo.isCover) as Record<string, unknown> | undefined;
  if (cover && (cover.url as string).length > 255) invalid('Cover URL exceeds image column capacity');
  if (Object.hasOwn(value, 'ideaId')) invalid('ideaId is read-only');
  return value as unknown as IdeaCardInput;
}

export function validateIdeaCatalog(value: unknown): IdeaCatalog {
  if (!object(value) || !json(value) || value.schemaVersion !== 1 || !Array.isArray(value.items)) invalid('Unsupported catalog format');
  const ids = new Set<string>();
  const photoIds = new Set<string>();
  for (const item of value.items) {
    const card = validateIdeaCard(item);
    if (ids.has(card.id)) invalid('Duplicate idea ID');
    ids.add(card.id);
    for (const photo of card.photos) {
      if (photoIds.has(photo.id)) invalid('Duplicate photo ID across ideas');
      photoIds.add(photo.id);
    }
  }
  return value as unknown as IdeaCatalog;
}
