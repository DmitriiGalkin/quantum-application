export interface ProgramIdea {
  id: number;
  label: string;
}

export type ProgramBlock = { kind: 'text'; markdown: string } | { kind: 'ideas'; ideas: ProgramIdea[] };

export interface ProgramSection {
  title: string;
  blocks: ProgramBlock[];
}

/** Keep the source order, replacing linked products with runs of idea cards. */
export function parseCraftProgram(source: string): ProgramSection[] {
  const sections: ProgramSection[] = [];
  let section: ProgramSection | undefined;
  for (const line of source.split(/\r?\n/)) {
    if (line.startsWith('## Связь с каталогом')) break;
    if (line.startsWith('### ')) {
      section = { title: line.slice(4), blocks: [] };
      sections.push(section);
      continue;
    }
    if (!section || line.startsWith('## ') || /^Рукописн/.test(line)) continue;
    const match = line.match(/\[идея №\d+\]\(https:\/\/q3-dev\.ru\/idea\/(\d+)\)/);
    if (match) {
      const label = line.slice(0, match.index).replace(/^\s*(?:\d+\.|-)\s*/, '').replace(/\s*—\s*$/, '').replaceAll('**', '').trim();
      // Non-list entries contain teaching notes which remain visible above their card.
      if (!/^\s*(?:\d+\.|-)\s/.test(line)) section.blocks.push({ kind: 'text', markdown: label });
      const previous = section.blocks.at(-1);
      const idea = { id: Number(match[1]), label };
      if (previous?.kind === 'ideas') previous.ideas.push(idea);
      else section.blocks.push({ kind: 'ideas', ideas: [idea] });
    } else if (line.trim()) {
      const previous = section.blocks.at(-1);
      if (previous?.kind === 'text') previous.markdown += `\n${line}`;
      else section.blocks.push({ kind: 'text', markdown: line });
    } else {
      const previous = section.blocks.at(-1);
      if (previous?.kind === 'text') previous.markdown += '\n';
    }
  }
  return sections;
}
