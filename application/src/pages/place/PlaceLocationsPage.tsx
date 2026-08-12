import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { fetchPlaceLocations } from '../../requests.ts';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../providers/AuthProvider.tsx';
import LocationCard from '../../features/place/LocationCard.tsx';
import { CreateLocationDialog } from '../../features/place/CreateLocationDialog.tsx';

export default function PlaceLocationsPage() {
  const { activePlace } = useAuth();
  const id = activePlace?.id;
  const placeId = Number(id);
  const [isCreateLocationDialogOpen, setIsCreateLocationDialogOpen] = useState(false);


  const { data: locations } = useQuery({
    queryKey: ['place-locations', placeId],
    queryFn: fetchPlaceLocations,
  });

  return (
    <Box>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Кабинеты
          </Typography>

          <IconButton aria-label="Сгенерировать обложку" onClick={() => setIsCreateLocationDialogOpen(true)}>
            <AddBusinessIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {locations?.map(location => (
            <LocationCard location={location} />
          ))}
        </Stack>
      </Stack>

      <CreateLocationDialog open={isCreateLocationDialogOpen} onClose={() => setIsCreateLocationDialogOpen(false)} />
    </Box>
  );
}
