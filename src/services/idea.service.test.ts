import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PoolConnection } from 'mysql2/promise';
import type { Idea } from '../entities/idea.js';

vi.mock('../utils/dbNext.js', () => ({ db: { transaction: async (fn: (conn: PoolConnection) => Promise<unknown>) => fn({} as PoolConnection) } }));
vi.mock('../repositories/idea.repository.js', () => ({ default: {
  findById: vi.fn(), create: vi.fn(), update: vi.fn(),
} }));
vi.mock('../repositories/idea-photo.repository.js', () => ({ IdeaPhotoRepository: { replace: vi.fn(), findByIdeaId: vi.fn().mockResolvedValue([]) } }));
import type { Passport } from '../entities/passport.js';
import { IdeaService } from './idea.service.js';
import IdeaRepository from '../repositories/idea.repository.js';
import { IdeaPhotoRepository } from '../repositories/idea-photo.repository.js';
import { FileService } from './file.service.js';

const card = { title: 'Test', description: '', catalogId: 'toy-test', photos: [] };
const passport = { id: 20 } as Passport;
const idea: Idea = { id: 1, userId: 0, passportId: 10, title: 'Test', description: '', image: null,
  userCount: 0, createdAt: '', isLiked: 0, today: false, photos: [], catalogId: card.catalogId };
vi.mock('../repositories/user.repository.js', () => ({ default: {} }));
vi.mock('./project.service.js', () => ({ ProjectService: {} }));
vi.mock('./assistant/assistants/image.assistant.js', () => ({ generateIdeaImage: vi.fn(), uploadImage: vi.fn() }));
beforeEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); });

describe('idea card ownership and identity', () => {
  it('reads catalog details and photos through the existing Idea entity', async () => {
    const data = { ...idea, userId: 0, cardData: { origin: null, notes: 'Предположение' } };
    const photo = { id: 'photo-test', fileName: 'test.jpg', driveFileId: 'drive-test', url: 'https://example.com/test.jpg', isCover: true };
    vi.mocked(IdeaRepository.findById).mockResolvedValue(data);
    vi.mocked(IdeaPhotoRepository.findByIdeaId).mockResolvedValueOnce([photo]);
    expect(await IdeaService.findById(card.catalogId)).toEqual({ ...data, user: null, photos: [photo] });
  });
  it('preserves catalog notes, metadata and photos when updating only title and description', async () => {
    const data = { ...idea, passportId: null, cardData: { id: card.catalogId, name: 'Test', description: '', origin: null }, catalogMetadata: { source: 'catalog' } };
    vi.mocked(IdeaRepository.findById).mockResolvedValue(data);
    await IdeaService.update(passport, card.catalogId, { title: 'Renamed', description: 'Updated' });
    expect(IdeaRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({
      cardData: { ...data.cardData, name: 'Renamed', description: 'Updated' }, catalogMetadata: data.catalogMetadata,
    }), expect.anything());
    expect(IdeaPhotoRepository.replace).not.toHaveBeenCalled();
  });
  it('rejects updates and imports by another owner before persisting data', async () => {
    vi.mocked(IdeaRepository.findById).mockResolvedValue(idea);
    await expect(IdeaService.update(passport, card.catalogId, card)).rejects.toMatchObject({ status: 403 });
    await expect(IdeaService.importCatalog({ schemaVersion: 1, items: [{ id: card.catalogId, name: card.title, description: '', photos: [] }] }, 20)).rejects.toMatchObject({ status: 403 });
    expect(IdeaRepository.update).not.toHaveBeenCalled();
    expect(IdeaPhotoRepository.replace).not.toHaveBeenCalled();
  });
  it('rejects a changed ID, duplicate creation and missing update', async () => {
    vi.mocked(IdeaRepository.findById).mockResolvedValue({ ...idea, passportId: 20 });
    await expect(IdeaService.update(passport, card.catalogId, { ...card, catalogId: 'different' })).rejects.toMatchObject({ status: 400 });
    vi.mocked(IdeaRepository.findById).mockResolvedValue(idea);
    await expect(IdeaService.create(passport, card)).rejects.toMatchObject({ status: 409 });
    vi.mocked(IdeaRepository.findById).mockResolvedValue(null);
    await expect(IdeaService.update(passport, card.catalogId, card)).rejects.toMatchObject({ status: 404 });
    expect(IdeaRepository.create).not.toHaveBeenCalled();
  });
  it('preserves S3 URLs and cover when the source catalog is imported again', async () => {
    const source = { id: 'photo-test', fileName: 'test.jpg', driveFileId: 'drive-test', url: 'https://drive.google.com/file/d/drive-test/view', isCover: true };
    const stored = { ...source, url: 'https://storage.yandexcloud.net/quantum-education/ideas/photo-test.jpg', sourceUrl: source.url };
    vi.mocked(IdeaRepository.findById).mockResolvedValue({ ...idea, passportId: null });
    vi.mocked(IdeaPhotoRepository.findByIdeaId).mockResolvedValueOnce([stored]);
    await IdeaService.importCatalog({ schemaVersion: 1, items: [{ id: card.catalogId, name: card.title, description: '', photos: [source] }] }, null);
    expect(IdeaPhotoRepository.replace).toHaveBeenCalledWith(1, [stored], expect.anything());
    expect(IdeaRepository.update).toHaveBeenCalledWith(1, expect.objectContaining({ image: stored.url }), expect.anything());
  });
  it('uploads a catalog original using FileService and saves the S3 cover with its source URL', async () => {
    const photo = { id: 'photo-test', fileName: 'test.jpg', driveFileId: 'drive-test', url: 'https://drive.google.com/file/d/drive-test/view', isCover: true };
    const url = FileService.publicUrl + 'ideas/photo-test.jpg';
    vi.mocked(IdeaRepository.findById).mockResolvedValue({ ...idea, passportId: null });
    vi.mocked(IdeaPhotoRepository.findByIdeaId).mockResolvedValue([photo]);
    const upload = vi.spyOn(FileService, 'uploadBuffer').mockResolvedValue(url);
    const buffer = Buffer.from([0xff, 0xd8, 0xff]);
    expect(await IdeaService.uploadCatalogPhotos(card.catalogId, async () => buffer)).toBe(1);
    expect(upload).toHaveBeenCalledWith(buffer, photo.fileName, 'image/jpeg', 'ideas/toy-test/photo-test-drive-test.jpg');
    expect(IdeaPhotoRepository.replace).toHaveBeenCalledWith(1, [{ ...photo, sourceUrl: photo.url, url }], expect.anything());
    expect(IdeaRepository.update).toHaveBeenCalledWith(1, { image: url }, expect.anything());
  });
  it('keeps database links unchanged if S3 upload fails', async () => {
    const photo = { id: 'photo-test', fileName: 'test.jpg', driveFileId: 'drive-test', url: 'https://drive.google.com/file/d/drive-test/view', isCover: true };
    vi.mocked(IdeaRepository.findById).mockResolvedValue({ ...idea, passportId: null });
    vi.mocked(IdeaPhotoRepository.findByIdeaId).mockResolvedValue([photo]);
    vi.spyOn(FileService, 'uploadBuffer').mockRejectedValue(new Error('S3 unavailable'));
    await expect(IdeaService.uploadCatalogPhotos(card.catalogId, async () => Buffer.from('image'))).rejects.toThrow('S3 unavailable');
    expect(IdeaPhotoRepository.replace).not.toHaveBeenCalled();
    expect(IdeaRepository.update).not.toHaveBeenCalled();
  });
});
