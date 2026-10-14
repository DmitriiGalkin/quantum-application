import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PlaceDto, RoomDto } from 'entities';

export function PlaceGallery({ place, rooms }: { place: PlaceDto; rooms: RoomDto[] }) {
  const photos = [
    ...(place.image ? [{ id: 'place', url: place.image, title: place.title ?? 'Центр' }] : []),
    ...rooms.flatMap(room => room.photos.map(photo => ({ id: `room-${room.id}-${photo.id}`, url: photo.url, title: room.title }))),
  ];
  const [selectedId, setSelectedId] = useState<string>();
  const [open, setOpen] = useState(false);
  const active = photos.find(photo => photo.id === selectedId) ?? photos[0];
  if (!active) return null;
  const index = photos.indexOf(active);
  const move = (delta: number) => setSelectedId(photos[(index + delta + photos.length) % photos.length].id);
  return <Box>
    <Box component="button" type="button" aria-label="Открыть фотографию центра или зала" onClick={() => setOpen(true)}
      sx={{ p: 0, border: 0, display: 'block', width: '100%', bgcolor: 'background.default', cursor: 'zoom-in', borderRadius: 3, overflow: 'hidden' }}>
      <Box component="img" src={active.url} alt={active.title} sx={{ display: 'block', width: '100%', height: { xs: 240, md: 400 }, objectFit: 'contain' }} />
    </Box>
    {photos.length > 1 && <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', py: 1 }}>
      {photos.map((photo, i) => <Box key={photo.id} component="button" type="button" aria-label={`Фотография ${i + 1}: ${photo.title}`}
        aria-pressed={photo.id === active.id} onClick={() => setSelectedId(photo.id)}
        sx={{ p: 0, flexShrink: 0, border: 2, borderColor: photo.id === active.id ? 'primary.main' : 'transparent', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }}>
        <Box component="img" loading="lazy" src={photo.url} alt={photo.title} sx={{ display: 'block', width: 96, height: 80, objectFit: 'cover' }} />
      </Box>)}
    </Stack>}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg" aria-label={`Фотографии ${place.title ?? 'центра'}`}
      onKeyDown={event => {
        if (photos.length > 1 && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
      }}>
      <DialogContent><Box component="img" src={active.url} alt={active.title} sx={{ width: '100%', height: '65vh', objectFit: 'contain' }} /></DialogContent>
      <DialogActions>
        {photos.length > 1 && <Button onClick={() => move(-1)}>Назад</Button>}
        <Typography aria-live="polite">{index + 1} / {photos.length}</Typography>
        {photos.length > 1 && <Button onClick={() => move(1)}>Вперёд</Button>}
        <Button onClick={() => setOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  </Box>;
}
