import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { RoomDto, UpdateLocation } from 'entities';
import { fetchDeleteLocation, fetchUpdateLocation, uploadIdeaPhoto } from '../../requests.ts';
import { photoFileError } from '../../shared/lib/idea-photos.ts';

export function RoomEditor({ room, onClose }: { room: RoomDto; onClose: () => void }) {
  const client = useQueryClient();
  const [values, setValues] = useState<UpdateLocation>({ title: room.title, description: room.description,
    capacity: room.capacity, hourlyRate: room.hourlyRate, photoUrls: room.photos.map(photo => photo.url) });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const refresh = async () => { await client.invalidateQueries({ queryKey: ['place-locations'] }); await client.invalidateQueries({ queryKey: ['place-profile'] }); onClose(); };
  const save = useMutation({ mutationFn: () => fetchUpdateLocation(room.id, values), onSuccess: refresh });
  const remove = useMutation({ mutationFn: () => fetchDeleteLocation(room.id), onSuccess: refresh });
  const upload = async (files: File[]) => {
    setUploadError('');
    if (files.length + values.photoUrls.length > 10) { setUploadError('Можно добавить до 10 фотографий'); return; }
    const error = files.map(photoFileError).find(Boolean);
    if (error) { setUploadError(error); return; }
    setUploading(true);
    try {
      for (const file of files) {
        const { url } = await uploadIdeaPhoto(file);
        setValues(current => ({ ...current, photoUrls: [...current.photoUrls, url] }));
      }
    } catch (error) { setUploadError(error instanceof Error ? error.message : 'Не удалось загрузить фотографии'); }
    finally { setUploading(false); }
  };
  const move = (index: number, delta: number) => {
    const urls = [...values.photoUrls];
    [urls[index], urls[index + delta]] = [urls[index + delta], urls[index]];
    setValues({ ...values, photoUrls: urls });
  };
  const pending = uploading || save.isPending || remove.isPending;
  return <Dialog open onClose={pending ? undefined : onClose} fullWidth maxWidth="md">
    <DialogTitle>Редактирование зала</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <TextField label="Название" required value={values.title} onChange={e => setValues({ ...values, title: e.target.value })} />
      <TextField label="Описание, оснащение и условия" multiline minRows={4} value={values.description ?? ''} onChange={e => setValues({ ...values, description: e.target.value || null })} />
      <TextField label="Вместимость (необязательно)" type="number" value={values.capacity ?? ''} onChange={e => setValues({ ...values, capacity: e.target.value === '' ? null : Number(e.target.value) })} slotProps={{ htmlInput: { min: 1, step: 1 } }} />
      <TextField label="Стоимость за час, руб. (необязательно)" type="number" value={values.hourlyRate ?? ''} onChange={e => setValues({ ...values, hourlyRate: e.target.value === '' ? null : Number(e.target.value) })} slotProps={{ htmlInput: { min: 0, step: 0.01 } }} />
      <Typography>Первая фотография — основная. До 10 файлов JPEG, PNG или WebP, каждый до 10 МиБ.</Typography>
      <Button component="label" disabled={pending || values.photoUrls.length >= 10}>Добавить фотографии
        <input hidden type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={e => { void upload(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
      </Button>
      {values.photoUrls.map((url, index) => <Stack key={url} spacing={1}>
        <Box component="img" src={url} alt={`Фото ${index + 1}${index === 0 ? ', основное' : ''}`} sx={{ width: '100%', maxWidth: 300, height: 170, objectFit: 'contain' }} />
        <Stack direction="row" spacing={1}>
          <Button disabled={pending || index === 0} onClick={() => move(index, -1)} aria-label={`Переместить фото ${index + 1} выше`}>Выше</Button>
          <Button disabled={pending || index === values.photoUrls.length - 1} onClick={() => move(index, 1)} aria-label={`Переместить фото ${index + 1} ниже`}>Ниже</Button>
          <Button disabled={pending} onClick={() => setValues({ ...values, photoUrls: values.photoUrls.filter((_, i) => i !== index) })}>Удалить фото {index + 1}</Button>
        </Stack>
      </Stack>)}
      {uploading && <Typography role="status">Загрузка фотографий…</Typography>}
      {uploadError && <Alert severity="error">{uploadError}</Alert>}
      {(save.isError || remove.isError) && <Alert severity="error">{save.error?.message ?? remove.error?.message}</Alert>}
      {confirmDelete && <Alert severity="warning">Удалить зал «{room.title}»? <Button color="error" disabled={pending} onClick={() => remove.mutate()}>Да, удалить зал</Button><Button onClick={() => setConfirmDelete(false)}>Оставить</Button></Alert>}
    </Stack></DialogContent>
    <DialogActions sx={{ flexWrap: 'wrap' }}>
      <Button color="error" disabled={pending} onClick={() => setConfirmDelete(true)}>Удалить зал</Button>
      <Button disabled={pending} onClick={onClose}>Закрыть</Button>
      <Button variant="contained" disabled={pending || !values.title.trim()} onClick={() => save.mutate()}>Сохранить</Button>
    </DialogActions>
  </Dialog>;
}
