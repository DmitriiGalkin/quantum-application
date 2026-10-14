import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { parseCraftProgram } from './craft-school-program.ts';
import savedIdeas from '../../features/idea/data/craft-program-cards.json';

const source = readFileSync(new URL('../../../docs/craft-school-program.md', import.meta.url), 'utf8');

it('preserves all linked IDs in source order and excludes transcription details', () => {
  const sections = parseCraftProgram(source);
  const ids = sections.flatMap(section => section.blocks.flatMap(block => block.kind === 'ideas' ? block.ideas.map(idea => idea.id) : []));
  expect(ids).toEqual([...source.matchAll(/https:\/\/q3-dev\.ru\/idea\/(\d+)/g)].map(match => Number(match[1])));
  expect(savedIdeas.map(idea => idea.id)).toEqual([...new Set(ids)]);
  expect(savedIdeas.every(idea => idea.title && idea.description && idea.image.startsWith('https://storage.yandexcloud.net/'))).toBe(true);
  expect(sections.map(section => section.title)).toEqual([
    '1–2 класс — Столярная мастерская', '3 класс — Столярная мастерская', '4 класс — Столярная мастерская',
    '5 класс', '6 класс', '7 класс', '8 класс', '9 класс', '10 класс', '11 класс', '12 класс', 'Общие рекомендации', 'Программы по ремеслу',
  ]);
  const text = sections.flatMap(section => section.blocks.flatMap(block => block.kind === 'text' ? [block.markdown] : [])).join('\n');
  expect(text).toContain('Паучёк');
  expect(text).toContain('Медная чаша');
  expect(text).toContain('Производственная точность');
  expect(text).toContain('Штокмаер');
  expect(text).not.toMatch(/Рукописн|SHA-256|Расшифровка|Связь с каталогом/);
  const sixth = sections.find(section => section.title === '6 класс')!;
  expect(sixth.blocks.map(block => block.kind)).toEqual(['ideas', 'text', 'ideas']);
});
