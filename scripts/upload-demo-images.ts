import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';
import { prepareDemoImages, verifyDemoImages } from '../src/services/demo-seed-assets.service.js';
import { extensionIdeas } from '../src/services/demo-extension.data.js';

try {
  const args = process.argv.slice(2);
  if (args.some(arg => arg !== '--extension')) throw new Error('Usage: upload-demo-images.ts [--extension]');
  const extension = args.includes('--extension');
  const folder = fileURLToPath(new URL(extension ? '../assets/demo-workshops/extension/' : '../assets/demo-workshops/', import.meta.url));
  const keys = extension ? extensionIdeas.map(row => row.key) : undefined;
  const images = await prepareDemoImages(folder, keys, extension ? 'extension/' : '');
  await verifyDemoImages(images, keys);
  await writeFile(`${folder}/images.json`, JSON.stringify(images, null, 2) + '\n');
  console.log(`Uploaded and verified ${Object.keys(images).length} demo images.`);
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : 'Demo image upload failed');
  process.exitCode = 1;
}
