import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import type { IdeaPhoto } from '../../../entities/idea.ts';
import { photoFileError } from '../../../shared/lib/idea-photos.ts';

export interface PhotoDraft {
  photo: IdeaPhoto;
  file?: File;
  error?: string;
}

function PhotoPreview({ entry }: { entry: PhotoDraft }) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    if (!entry.file) return;
    const url = URL.createObjectURL(entry.file);
    if (image.current) image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [entry.file]);
  return <Box component="img" ref={image} src={entry.file ? undefined : entry.photo.url} alt={entry.photo.fileName}
    sx={{ width: 120, height: 100, objectFit: 'contain' }} />;
}

export interface IdeaFormValues {
  title: string;
  description: string;
  photos: PhotoDraft[];
}

interface Props {
  values: IdeaFormValues;
  loading?: boolean;
  error?: string;
  submitLabel?: string;
  onChange: (values: IdeaFormValues) => void;
  onSubmit: () => void;
}

export default function IdeaForm({ values, loading = false, error, submitLabel = 'Сохранить', onChange, onSubmit }: Props) {
  const [fileError, setFileError] = useState<string>();
  const updatePhotos = (photos: PhotoDraft[]) => onChange({ ...values, photos });
  const move = (index: number, direction: number) => {
    const photos = [...values.photos];
    [photos[index], photos[index + direction]] = [photos[index + direction], photos[index]];
    updatePhotos(photos);
  };
  return (
    <Stack spacing={2}>
      <TextField
        label="Название"
        disabled={loading}
        value={values.title}
        onChange={e =>
          onChange({
            ...values,
            title: e.target.value,
          })
        }
      />

      <TextField
        label="Описание"
        disabled={loading}
        multiline
        rows={4}
        value={values.description}
        onChange={e =>
          onChange({
            ...values,
            description: e.target.value,
          })
        }
      />

      <Button component="label" variant="outlined" disabled={loading}>
        Добавить фотографии
        <input hidden type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={loading} onChange={event => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          const invalid = files.find(file => photoFileError(file));
          if (invalid) { setFileError(`${invalid.name}: ${photoFileError(invalid)}`); return; }
          setFileError(undefined);
          const entries = files.map((file, index) => ({ file, photo: { id: crypto.randomUUID(), fileName: file.name,
            url: '', isCover: values.photos.length === 0 && index === 0 } }));
          updatePhotos([...values.photos, ...entries]);
        }} />
      </Button>
      <Typography variant="caption">JPEG, PNG или WebP, до 10 МиБ на фотографию. Первая фотография — обложка.</Typography>
      {fileError && <Alert severity="error">{fileError}</Alert>}
      {values.photos.map((entry, index) => <Stack key={entry.photo.id} spacing={1} sx={{ border: 1, borderColor: 'divider', p: 1, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <PhotoPreview entry={entry} />
          <Typography sx={{ overflowWrap: 'anywhere' }}>{entry.photo.fileName}{entry.photo.isCover ? ' · Обложка' : ''}</Typography>
        </Stack>
        {entry.error && <Alert severity="error">{entry.error} — нажмите «Сохранить» для повторной загрузки.</Alert>}
        <Stack direction="row" sx={{ flexWrap: 'wrap' }}>
          <Button disabled={loading || entry.photo.isCover} onClick={() => updatePhotos(values.photos.map(item => ({ ...item,
            photo: { ...item.photo, isCover: item.photo.id === entry.photo.id } })))}>Обложка</Button>
          <Button disabled={loading || index === 0} onClick={() => move(index, -1)}>Раньше</Button>
          <Button disabled={loading || index === values.photos.length - 1} onClick={() => move(index, 1)}>Позже</Button>
          <Button color="error" disabled={loading} onClick={() => {
            const photos = values.photos.filter(item => item.photo.id !== entry.photo.id);
            updatePhotos(entry.photo.isCover ? photos.map((item, i) => ({ ...item, photo: { ...item.photo, isCover: i === 0 } })) : photos);
          }}>Удалить</Button>
        </Stack>
      </Stack>)}
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" disabled={loading || !values.title.trim()} onClick={onSubmit}>
        {loading ? 'Сохранение...' : submitLabel}
      </Button>
    </Stack>
  );
}
