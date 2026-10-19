// @vitest-environment jsdom
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { studentIdea } from '../../../pages/card-gallery-data.ts';
import IdeaCard from './IdeaCard.tsx';

it('shows the student and message action without linked projects', () => {
  const html = renderToString(<MemoryRouter><IdeaCard idea={studentIdea} /></MemoryRouter>);
  const host = globalThis.document.createElement('div'); host.innerHTML = html;
  expect(host.textContent).toContain(studentIdea.user.title);
  expect(host.querySelector('button[aria-label="Написать сообщение"]')).not.toBeNull();
  expect(host.textContent).not.toContain(studentIdea.projects[0].title);
  expect(host.textContent).not.toContain('Связанных проектов пока нет');
});
