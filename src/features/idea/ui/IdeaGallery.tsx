import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { IdeaDto } from '../../../entities/idea.ts';
import { ideaGallery } from '../../../shared/lib/idea-photos.ts';

function GalleryImage({ url, title, full = false }: { url: string; title: string; full?: boolean }) {
  const [failed, setFailed] = useState(false);
  return failed ? <Box role="img" aria-label={title} sx={{ p: 4 }}>Не удалось загрузить фотографию</Box>
    : <Box component="img" src={url} alt={title} onError={() => setFailed(true)}
      sx={{ width: '100%', height: full ? '70vh' : 'auto', objectFit: 'contain', display: 'block' }} />;
}

export default function IdeaGallery({ idea }: { idea: IdeaDto }) {
  const photos = ideaGallery(idea);
  const [selectedId, setSelectedId] = useState<string>();
  const [open, setOpen] = useState(false);
  const active = photos.find(photo => photo.id === selectedId) ?? photos.find(photo => photo.isCover) ?? photos[0];
  const index = active ? photos.indexOf(active) : 0;
  const url = active?.url || idea.image || '/bg.jpeg';
  const title = `${idea.title}, фотография ${index + 1}`;
  const step = (direction: number) => setSelectedId(photos[(index + direction + photos.length) % photos.length].id);
  return <>
    <Box component="button" type="button" aria-label="Открыть фотографию" onClick={() => setOpen(true)}
      sx={{ display: 'block', width: '100%', border: 0, p: 0, bgcolor: 'background.default', cursor: 'zoom-in' }}>
      <GalleryImage key={url} url={url} title={title} />
    </Box>
    {photos.length > 1 && <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', p: 1 }}>
      {photos.map((photo, i) => <Box key={photo.id} component="button" type="button" aria-label={`Фотография ${i + 1}`}
        aria-pressed={photo.id === active?.id} onClick={() => setSelectedId(photo.id)}
        sx={{ p: 0, flexShrink: 0, border: 2, borderColor: photo.id === active?.id ? 'primary.main' : 'transparent', cursor: 'pointer' }}>
        <Box component="img" loading="lazy" src={photo.url} alt={`${idea.title}, фотография ${i + 1}`}
          sx={{ width: 96, height: 96, objectFit: 'cover', display: 'block' }} />
      </Box>)}
    </Stack>}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="lg" aria-label={idea.title}
      onKeyDown={event => {
        if (photos.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <DialogContent><GalleryImage key={url} url={url} title={title} full /></DialogContent>
      <DialogActions>
        {photos.length > 1 && <Button onClick={() => step(-1)}>Назад</Button>}
        <Typography>{index + 1} / {Math.max(1, photos.length)}</Typography>
        {photos.length > 1 && <Button onClick={() => step(1)}>Вперёд</Button>}
        <Button onClick={() => setOpen(false)}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  </>;
}
