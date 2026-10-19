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
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

export function RoomGallery({ title, photos }: { title: string; photos: LocationPhoto[] }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  if (!photos.length) return <Box role="img" aria-label={`Фото зала «${title}» отсутствует`} sx={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}><MeetingRoomIcon sx={{ fontSize: 48 }} color="action" /></Box>;
  const activeIndex = Math.min(index, photos.length - 1);
  const move = (delta: number) => setIndex((activeIndex + delta + photos.length) % photos.length);
  return <>
    <Button onClick={() => setOpen(true)} aria-label={`Открыть фотографии: ${title}`} sx={{ p: 0, width: '100%' }}>
      <Box component="img" src={photos[activeIndex].url} alt={`${title}, фото ${activeIndex + 1}`} sx={{ width: '100%', height: 260, objectFit: 'cover' }} />
    </Button>
    {photos.length > 1 && <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
      <Button aria-label={`Предыдущее фото: ${title}`} onClick={() => move(-1)}>←</Button>
      <Typography variant="body2" aria-live="polite">{activeIndex + 1} / {photos.length}</Typography>
      <Button aria-label={`Следующее фото: ${title}`} onClick={() => move(1)}>→</Button>
    </Stack>}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" onKeyDown={event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
    }}>
      <DialogTitle>{title} — фотографии</DialogTitle>
      <DialogContent><Box component="img" src={photos[activeIndex].url} alt={`${title}, фото ${activeIndex + 1}`} sx={{ width: '100%', maxHeight: '65vh', objectFit: 'contain' }} />
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
          <Button disabled={photos.length < 2} onClick={() => move(-1)}>Предыдущее</Button>
          <Typography aria-live="polite">{activeIndex + 1} / {photos.length}</Typography>
          <Button disabled={photos.length < 2} onClick={() => move(1)}>Следующее</Button>
        </Stack>
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Закрыть</Button></DialogActions>
    </Dialog>
  </>;
}
