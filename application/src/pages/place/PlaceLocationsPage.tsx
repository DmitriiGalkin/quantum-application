import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import { fetchPlaceLocations } from '../../requests.ts';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../providers/AuthProvider.tsx';
import LocationCard from '../../features/place/LocationCard.tsx';
import { CreateLocationDialog } from '../../features/place/CreateLocationDialog.tsx';

export default function PlaceLocationsPage() {
  const { placeId } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: locations } = useQuery({
    queryKey: ['place-locations', placeId],
    queryFn: fetchPlaceLocations,
  });

  return (
    <>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Кабинеты
          </Typography>

          <IconButton aria-label="Сгенерировать обложку" onClick={() => setOpen(true)}>
            <AddBusinessIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {locations?.map(location => (
            <LocationCard location={location} />
          ))}
        </Stack>
      </Stack>

      <CreateLocationDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
