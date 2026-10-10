import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { IdeaCardService } from '../src/services/idea-card.service.js';
import { validateIdeaCatalog } from '../src/services/idea-card.validation.js';
import { db } from '../src/utils/dbNext.js';

try {
  const file = process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? 'toy-catalog.json';
  const catalog = validateIdeaCatalog(JSON.parse(await readFile(file, 'utf8')) as unknown);
  if (process.argv.includes('--dry-run')) {
    console.log(`Valid catalog: ${catalog.items.length} ideas, ${catalog.items.reduce((n, card) => n + card.photos.length, 0)} photos.`);
  } else {
    const result = await IdeaCardService.import(catalog, null);
    console.log(`Imported ${result.ideas} ideas, ${result.photos} photos.`);
    const readCards = async () => {
      const cards = [];
      for (const item of catalog.items) {
        const card = await IdeaCardService.findById(item.id);
        if (!card) throw new Error('Imported card is missing');
        const { ideaId, ...original } = card;
        if (!isDeepStrictEqual(original, item)) throw new Error('Imported card differs from source');
        cards.push({ id: card.id, ideaId });
      }
      return cards;
    };
    const before = await readCards();
    await IdeaCardService.import(catalog, null);
    if (!isDeepStrictEqual(before, await readCards())) throw new Error('Repeat import changed idea IDs');
    console.log('Verified source round-trip and repeat import: stable idea IDs, no duplicate photos.');
  }
} catch (error) {
  console.error(error instanceof Error && 'code' in error ? `Import failed (${String(error.code)}).` : error instanceof Error ? error.message : 'Import failed');
  process.exitCode = 1;
} finally {
  await db.close();
}
