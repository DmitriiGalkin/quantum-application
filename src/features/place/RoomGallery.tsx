import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LocationPhoto } from 'entities';

export function RoomGallery({ title, photos }: { title: string; photos: LocationPhoto[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;
  const move = (delta: number) => setIndex(current => (current + delta + photos.length) % photos.length);
  return <>
    <Button onClick={() => { setIndex(0); setOpen(true); }} aria-label={`Открыть фотографии: ${title}`} sx={{ p: 0, width: '100%' }}>
      <Box component="img" src={photos[0].url} alt={title} sx={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 2 }} />
    </Button>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }}>
      <DialogTitle>{title} — фотографии</DialogTitle>
      <DialogContent><Box component="img" src={photos[index].url} alt={`${title}, фото ${index + 1}`} sx={{ width: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Button disabled={photos.length < 2} onClick={() => move(-1)}>Предыдущее</Button>
          <Typography aria-live="polite">{index + 1} / {photos.length}</Typography>
          <Button disabled={photos.length < 2} onClick={() => move(1)}>Следующее</Button>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Закрыть</Button></DialogActions>
    </Dialog>
  </>;
}
