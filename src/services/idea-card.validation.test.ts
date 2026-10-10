import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { validateIdeaCard, validateIdeaCatalog } from './idea-card.validation.js';

const source: unknown = JSON.parse(readFileSync('toy-catalog.json', 'utf8'));

describe('idea catalog validation', () => {
  it('preserves every source field, explicit null and assumption', () => {
    const catalog = validateIdeaCatalog(source);
    expect(catalog).toEqual(source);
    expect(catalog.items).toHaveLength(4);
    expect(catalog.items.flatMap(item => item.photos)).toHaveLength(11);
    expect(catalog.items[0].canMakeWithChildren).toBeNull();
    expect(catalog.items[0].manufacturingNotes).toEqual([{ text: 'Обработан на фрезерном станке', source: 'со слов пользователя' }]);
  });
  it('retains unknown fields and distinguishes absent values from null', () => {
    const card = { ...validateIdeaCatalog(source).items[0], futureField: { confirmed: null } };
    expect(validateIdeaCard(card)).toEqual(card);
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
    expect(() => validateIdeaCard(card)).toThrow('HTTP(S)');
    card.photos[0].url = 'https://example.com/image';
    card.photos[1].isCover = true;
    expect(() => validateIdeaCard(card)).toThrow('one cover');
    expect(() => validateIdeaCard({ ...card, photos: [], ideaId: 1 })).toThrow('read-only');
    expect(() => validateIdeaCatalog({ schemaVersion: 2, items: [] })).toThrow('Unsupported');
  });
});
