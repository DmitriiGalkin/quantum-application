import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchPlaceLocations } from '../../requests.ts';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../providers/auth-context.ts';
import LocationCard from '../../features/place/LocationCard.tsx';
import { CreateLocationDialog } from '../../features/place/CreateLocationDialog.tsx';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import type { RoomDto } from 'entities';
import { RoomEditor } from '../../features/place/RoomEditor.tsx';


export default function PlaceLocationsPage() {
  const { placeId } = useAuth();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoomDto | null>(null);

  const { data: locations, isPending, error, refetch } = useQuery({
    queryKey: ['place-locations', placeId],
    queryFn: fetchPlaceLocations,
    enabled: Boolean(placeId),
  });

  return (
    <>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Кабинеты
          </Typography>

          <IconButton aria-label="Добавить зал" onClick={() => setOpen(true)}>
            <DomainAddIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {isPending && <Typography role="status">Загрузка залов…</Typography>}
          {error && <Alert severity="error" action={<Button onClick={() => void refetch()}>Повторить</Button>}>{error.message}</Alert>}
          {locations?.length === 0 && <Typography>Залы пока не добавлены.</Typography>}
          {locations?.map(location => (
            <LocationCard key={location.id} location={location} actions={<Button sx={{ mt: 'auto', alignSelf: 'flex-start' }} onClick={() => setEditing(location)}>Редактировать зал</Button>} />
          ))}
        </Stack>
      </Stack>

      <CreateLocationDialog open={open} onClose={() => setOpen(false)} />
      {editing && <RoomEditor key={editing.id} room={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
