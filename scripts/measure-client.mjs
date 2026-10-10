import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const root = new URL('../dist/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('.vite/manifest.json', root), 'utf8'));
function collect(entries) {
  const files = new Set();
  const visited = new Set();
  function visit(key) {
    if (visited.has(key)) return;
    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) throw new Error(`Missing manifest entry: ${key}`);
    if (chunk.file.endsWith('.js')) files.add(chunk.file);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  }
  entries.forEach(visit);
  return files;
}
async function measure(files) {
  let raw = 0;
  let gzip = 0;
  for (const file of files) {
    const content = await readFile(new URL(file, root));
    raw += content.length;
    gzip += gzipSync(content).length;
  }
  return { files: files.size, rawKB: Number((raw / 1000).toFixed(2)), gzipKB: Number((gzip / 1000).toFixed(2)) };
}
console.log(JSON.stringify({
  application: await measure(collect(['index.html'])),
  home: await measure(collect(['index.html', 'src/pages/IdeasPage.tsx'])),
}, null, 2));
