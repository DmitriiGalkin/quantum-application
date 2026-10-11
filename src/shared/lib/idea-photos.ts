import type { IdeaDto, IdeaPhoto } from '../../entities/idea.ts';

export const MAX_IDEA_PHOTO_BYTES = 10 * 1024 * 1024;
export const IDEA_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function photoFileError(file: { size: number; type: string }): string | undefined {
  if (!IDEA_PHOTO_TYPES.includes(file.type)) return 'Выберите фотографию JPEG, PNG или WebP';
  if (!file.size) return 'Файл пуст';
  if (file.size > MAX_IDEA_PHOTO_BYTES) return 'Размер фотографии не должен превышать 10 МиБ';
}

export function ideaGallery(idea: IdeaDto): IdeaPhoto[] {
  const photos = idea.photos ?? [];
  if (!idea.image || photos.some(photo => photo.url === idea.image)) return photos;
  // Preserve legacy and generated covers when opening the photo editor.
  let id = `idea-${idea.id}-cover`;
  for (let suffix = 2; photos.some(photo => photo.id === id); suffix++) id = `idea-${idea.id}-cover-${suffix}`;
  return [{ id, fileName: 'cover.jpg', url: idea.image, isCover: true },
    ...photos.map(photo => ({ ...photo, isCover: false }))];
}
