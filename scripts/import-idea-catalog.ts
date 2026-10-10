import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { IdeaService } from '../src/services/idea.service.js';
import { validateIdeaCatalog } from '../src/services/idea.validation.js';
import { db } from '../src/utils/dbNext.js';

try {
  const file = process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? 'toy-catalog.json';
  const catalog = validateIdeaCatalog(JSON.parse(await readFile(file, 'utf8')) as unknown);
  if (process.argv.includes('--dry-run')) {
    console.log(`Valid catalog: ${catalog.items.length} ideas, ${catalog.items.reduce((n, card) => n + card.photos.length, 0)} photos.`);
  } else {
    if (!process.argv.includes('--verify-only')) {
      const result = await IdeaService.importCatalog(catalog, null);
      console.log(`Imported ${result.ideas} ideas, ${result.photos} photos.`);
    }
    const readIdeas = async () => {
      const ids: { id: string; ideaId: number }[] = [];
      for (const item of catalog.items) {
        const idea = await IdeaService.findById(item.id);
        const photos = idea?.photos.map(photo => {
          if (typeof photo.sourceUrl !== 'string') return photo;
          const { sourceUrl, ...original } = photo;
          return { ...original, url: sourceUrl };
        });
        if (!idea || !isDeepStrictEqual({ ...idea.cardData, photos }, item)) throw new Error('Imported idea differs from source');
        ids.push({ id: item.id, ideaId: idea.id });
      }
      return ids;
    };
    const before = await readIdeas();
    if (!process.argv.includes('--verify-only')) {
      await IdeaService.importCatalog(catalog, null);
      if (!isDeepStrictEqual(before, await readIdeas())) throw new Error('Repeat import changed idea IDs');
      console.log('Verified source round-trip and repeat import: stable idea IDs, no duplicate photos.');
    } else console.log('Verified persisted ideas and photos against source without writes.');
  }
} catch (error) {
  console.error(error instanceof Error && 'code' in error ? `Import failed (${String(error.code)}).` : error instanceof Error ? error.message : 'Import failed');
  process.exitCode = 1;
} finally {
  await db.close();
}
