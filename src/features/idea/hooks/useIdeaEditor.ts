import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCreateIdea, fetchUpdateIdea, uploadIdeaPhoto } from '../../../requests.ts';
import type { IdeaFormValues } from '../ui/IdeaForm.tsx';
import { photoFileError } from '../../../shared/lib/idea-photos.ts';

export function useIdeaEditor(initial: IdeaFormValues, onSaved: (id: number) => void, ideaId?: number) {
  const [form, setForm] = useState(initial);
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: async () => {
      const photos = [];
      for (const entry of form.photos) {
        let photo = entry.photo;
        if (entry.file) {
          try {
            const error = photoFileError(entry.file);
            if (error) throw new Error(error);
            const { url } = await uploadIdeaPhoto(entry.file);
            photo = { ...photo, url };
            setForm(current => ({ ...current, photos: current.photos.map(item => item.photo.id === photo.id ? { photo } : item) }));
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Не удалось загрузить фотографию';
            setForm(current => ({ ...current, photos: current.photos.map(item => item.photo.id === photo.id ? { ...item, error: message } : item) }));
            throw new Error(`${photo.fileName}: ${message}`, { cause: error });
          }
        }
        photos.push(photo);
      }
      const data = { title: form.title, description: form.description, photos };
      if (ideaId !== undefined) {
        await fetchUpdateIdea(ideaId, data);
        return ideaId;
      }
      return fetchCreateIdea(data);
    },
    onSuccess: async id => {
      await Promise.all(['idea', 'ideas', 'teacher-ideas'].map(key => queryClient.invalidateQueries({ queryKey: [key] })));
      onSaved(id);
    },
  });
  return { form, setForm, onSubmit: () => save.mutate(), loading: save.isPending, error: save.error?.message };
}
