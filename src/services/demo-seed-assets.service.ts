import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { FileService } from './file.service.js';
import { DEMO_SEED_KEY, demoIdeas } from './demo-seed.data.js';

export const demoImageKeys = [
  ...demoIdeas.map(idea => idea.key),
  ...Array.from({ length: 6 }, (_, index) => `teacher-${index + 1}`),
  ...Array.from({ length: 4 }, (_, index) => `centre-${index + 1}`),
];

export async function prepareDemoImages(folder: string, keys = demoImageKeys, subfolder = ''): Promise<Record<string, string>> {
  const images: Record<string, string> = {};
  for (const key of keys) {
    const buffer = await readFile(`${folder}/${key}.jpg`);
    if (!buffer.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) throw new Error(`Invalid JPEG: ${key}`);
    const digest = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    const storageKey = `demo/${DEMO_SEED_KEY}/${subfolder}${key}-${digest}.jpg`;
    const url = FileService.publicUrl + storageKey;
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (response.status === 404) await FileService.uploadBuffer(buffer, `${key}.jpg`, 'image/jpeg', storageKey);
    else if (!response.ok) throw new Error(`Cannot inspect S3 image ${key}: HTTP ${response.status}`);
    images[key] = url;
  }
  return images;
}

export async function verifyDemoImages(images: Record<string, string>, keys = demoImageKeys): Promise<void> {
  for (const key of keys) {
    const url = images[key];
    if (!url?.startsWith(`${FileService.publicUrl}demo/${DEMO_SEED_KEY}/`)) throw new Error(`Missing image: ${key}`);
    const response = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Image unavailable: ${key}`);
  }
}
