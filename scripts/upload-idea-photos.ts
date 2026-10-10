import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { IdeaService } from '../src/services/idea.service.js';
import { validateIdeaCatalog } from '../src/services/idea.validation.js';
import { FileService } from '../src/services/file.service.js';
import { db } from '../src/utils/dbNext.js';

try {
  const catalog = validateIdeaCatalog(JSON.parse(await readFile(process.argv[2] ?? 'toy-catalog.json', 'utf8')) as unknown);
  const folder = resolve(process.argv[3] ?? '.cache/idea-catalog');
  let count = 0;
  for (const item of catalog.items) {
    count += await IdeaService.uploadCatalogPhotos(item.id, async photo => {
      const original = item.photos.find(source => source.id === photo.id && source.driveFileId === photo.driveFileId);
      if (!original) throw new Error('Photo does not match source catalog');
      const buffer = await readFile(resolve(folder, `${photo.id}.jpg`));
      if (buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) throw new Error('Expected a JPEG original');
      return buffer;
    });
    const idea = await IdeaService.findById(item.id);
    if (!idea || idea.photos.length !== item.photos.length || !FileService.isStorageUrl(idea.image ?? '')) throw new Error('Photo migration verification failed');
    for (const photo of idea.photos) {
      if (!FileService.isStorageUrl(photo.url)) throw new Error('Photo still points outside S3');
      const response = await fetch(photo.url, { headers: { Range: 'bytes=0-2' }, signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error('S3 image is not publicly readable');
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) throw new Error('S3 response is not a JPEG');
    }
    console.log(`${item.id}: ${idea.photos.length} public S3 photos, cover updated.`);
  }
  console.log(`Uploaded ${count} photos; stable IDs and source URLs preserved.`);
} catch (error) {
  console.error(error instanceof Error && 'code' in error ? `Photo migration failed (${String(error.code)}).` : error instanceof Error ? error.message : 'Photo migration failed');
  process.exitCode = 1;
} finally { await db.close(); }
