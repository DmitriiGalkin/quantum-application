import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateCatalogItem, validateIdeaCatalog, validateIdea } from './idea.validation.js';

const source: unknown = JSON.parse(readFileSync('toy-catalog.json', 'utf8'));

describe('user photo validation', () => {
  const photo = { id: 'local-photo', fileName: 'robot.png', url: 'https://example.com/robot.png', isCover: true };
  it('accepts local photos without Drive metadata while retaining strict catalog validation', () => {
    expect(validateIdea({ title: 'Robot', description: '', photos: [photo] }).photos).toEqual([photo]);
    expect(() => validateCatalogItem({ id: 'robot', name: 'Robot', description: '', photos: [photo] })).toThrow('driveFileId');
  });
  it('requires one cover for a nonempty user gallery, permits clearing and rejects duplicate IDs', () => {
    expect(() => validateIdea({ title: 'Robot', description: '', photos: [{ ...photo, isCover: false }] })).toThrow('cover');
    expect(validateIdea({ title: 'Robot', description: '', photos: [] }).photos).toEqual([]);
    expect(() => validateIdea({ title: 'Robot', description: '', photos: [photo, { ...photo, isCover: false }] })).toThrow('Duplicate');
  });
});

describe('idea catalog validation', () => {
  it('accepts a generated S3 cover with provenance while retaining Drive requirements for originals', () => {
    const card = structuredClone(validateIdeaCatalog(source).items[0]);
    expect(card.photos[0].origin).toBe('generated');
    expect(card.photos[0].sourcePhotoIds).toHaveLength(8);
    expect(card.photos.filter(photo => photo.isCover)).toHaveLength(1);
    card.photos[0].url = 'https://example.com/generated.png';
    expect(() => validateCatalogItem(card)).toThrow('Quantum S3');
    card.photos[0].url = validateIdeaCatalog(source).items[0].photos[0].url;
    delete card.photos[0].promptFile;
    expect(() => validateCatalogItem(card)).toThrow('provenance');
    const original = structuredClone(validateIdeaCatalog(source).items[0]);
    delete original.photos[1].driveFileId;
    expect(() => validateCatalogItem(original)).toThrow('driveFileId');
  });
  it('preserves every source field, explicit null and assumption', () => {
    const catalog = validateIdeaCatalog(source);
    expect(catalog).toEqual(source);
    expect(catalog.items).toHaveLength(4);
    expect(catalog.items.flatMap(item => item.photos)).toHaveLength(12);
    expect(catalog.items[0].canMakeWithChildren).toBeNull();
    expect(catalog.items[0].manufacturingNotes).toEqual([{ text: 'Обработан на фрезерном станке', source: 'со слов пользователя' }]);
  });
  it('retains unknown fields and distinguishes absent values from null', () => {
    const card = { ...validateIdeaCatalog(source).items[0], futureField: { confirmed: null } };
    expect(validateCatalogItem(card)).toEqual(card);
    expect(Object.hasOwn(validateIdeaCatalog(source).items[1], 'manufacturingNotes')).toBe(false);
  });
  it('rejects duplicate stable IDs across the entire import', () => {
    const catalog = structuredClone(validateIdeaCatalog(source));
    catalog.items[1].photos[0].id = catalog.items[0].photos[0].id;
    expect(() => validateIdeaCatalog(catalog)).toThrow('Duplicate photo ID');
    catalog.items[1] = catalog.items[0];
    expect(() => validateIdeaCatalog(catalog)).toThrow('Duplicate idea ID');
  });
  it('rejects malformed photos, multiple covers, reserved fields and unsupported versions', () => {
    const card = structuredClone(validateIdeaCatalog(source).items[0]);
    card.photos[0].url = 'javascript:alert(1)';
    expect(() => validateCatalogItem(card)).toThrow('HTTP(S)');
    card.photos[0].url = validateIdeaCatalog(source).items[0].photos[0].url;
    card.photos[1].isCover = true;
    expect(() => validateCatalogItem(card)).toThrow('one cover');
    expect(() => validateCatalogItem({ ...card, photos: [], ideaId: 1 })).toThrow('read-only');
    expect(() => validateIdeaCatalog({ schemaVersion: 2, items: [] })).toThrow('Unsupported');
  });
});
