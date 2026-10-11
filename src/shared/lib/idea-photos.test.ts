import { expect, it } from 'vitest';
import type { IdeaDto } from '../../entities/idea.ts';
import { ideaGallery } from './idea-photos.ts';

it('retains legacy and generated covers without dropping imported metadata or duplicating photos', () => {
  const photo = { id: 'catalog-photo', fileName: 'photo.jpg', url: 'https://example.com/photo.jpg', isCover: true,
    driveFileId: 'drive', sourceUrl: 'https://drive.google.com/photo', custom: { observation: null } };
  const idea: IdeaDto = { id: 1, user: null, today: false, image: 'https://example.com/cover.jpg', photos: [photo] };
  const gallery = ideaGallery(idea);
  expect(gallery).toEqual([{ id: 'idea-1-cover', fileName: 'cover.jpg', url: idea.image, isCover: true }, { ...photo, isCover: false }]);
  expect(ideaGallery({ ...idea, image: photo.url })).toEqual([photo]);
  expect(ideaGallery({ ...idea, image: null, photos: [] })).toEqual([]);
  const generated = ideaGallery({ ...idea, photos: [{ ...photo, id: 'idea-1-cover' }] });
  expect(generated.map(item => item.id)).toEqual(['idea-1-cover-2', 'idea-1-cover']);
});
