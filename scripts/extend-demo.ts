import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { withDemoConnection, reportCliError } from './demo-cli.js';
import { DemoSeedService } from '../src/services/demo-seed.service.js';
import { DemoExtensionService, extensionExpectedCounts } from '../src/services/demo-extension.service.js';
import { extensionIdeas, extensionPrefix } from '../src/services/demo-extension.data.js';
import { prepareDemoImages, verifyDemoImages } from '../src/services/demo-seed-assets.service.js';

const args = process.argv.slice(2);
const folder = resolve('assets/demo-workshops/extension');
const keys = extensionIdeas.map(row => row.key);
try {
  if (args.some(arg => !['--apply', '--verify'].includes(arg)) || args.length > 1) throw new Error('Usage: extend-demo.ts [--apply | --verify]');
  await withDemoConnection(async conn => {
    await conn.beginTransaction();
    const before = await DemoSeedService.inspect(conn);
    const existing = before.records.filter(row => row.entityKey.startsWith(extensionPrefix));
    console.log(JSON.stringify({ planned: extensionExpectedCounts, existing: DemoSeedService.report(existing).counts }, null, 2));
    if (existing.length) DemoExtensionService.verify(existing, before.tables);
    await conn.rollback();
    if (!args.length) return;
    const images = args.includes('--verify') ? JSON.parse(await readFile(`${folder}/images.json`, 'utf8')) as Record<string, string> : await prepareDemoImages(folder, keys, 'extension/');
    await verifyDemoImages(images, keys);
    if (args.includes('--apply')) await writeFile(`${folder}/images.json`, JSON.stringify(images, null, 2) + '\n');
    await conn.beginTransaction();
    if (args.includes('--apply')) {
      console.log(JSON.stringify(await DemoExtensionService.apply(conn, images), null, 2));
      await conn.commit();
      await conn.beginTransaction();
    }
    const after = await DemoSeedService.inspect(conn);
    console.log(JSON.stringify({ verified: DemoExtensionService.verify(after.records.filter(row => row.entityKey.startsWith(extensionPrefix)), after.tables) }, null, 2));
    const actualImages = Object.fromEntries(extensionIdeas.map(idea => {
      const record = after.records.find(row => row.entityType === 'idea' && row.entityKey === extensionPrefix + idea.key);
      return [idea.key, String(after.tables.idea.find(row => row.id === record?.recordId)?.image)];
    }));
    await verifyDemoImages(actualImages, keys);
    await conn.rollback();
  });
} catch (error) { reportCliError(error); }
