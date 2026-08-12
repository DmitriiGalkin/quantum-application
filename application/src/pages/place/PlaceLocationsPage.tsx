import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchAddTeacher, fetchPlaceLocations, fetchPlaceTeachers } from '../../requests.ts';
import TeacherCard from '../../features/teacher/TeacherCard.tsx';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { useAuth } from '../../providers/AuthProvider.tsx';
import LocationCard from '../../features/place/LocationCard.tsx';
import { CreateProjectDialog } from '../../features/project/ui/CreateProjectDialog.tsx';
import { CreateLocationDialog } from '../../features/place/CreateLocationDialog.tsx';

export default function PlaceLocationsPage() {
  const { activePlace } = useAuth();
  const id = activePlace?.id;
  const placeId = Number(id);
  const [isCreateLocationDialogOpen, setIsCreateLocationDialogOpen] = useState(false);

  const [title, setTitle] = useState('');

  const { data: locations, refetch } = useQuery({
    queryKey: ['place-locations', placeId],
    queryFn: fetchPlaceLocations,
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher(Number(passportId)),
    onSuccess: () => {
      refetch();
      setTitle('');
    },
  });


  const inviteUrl = `${window.location.origin}/place/${placeId}/invite`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
  }

  async function handleShare() {
    if (!navigator.share) {
      await handleCopy();
      return;
    }

    try {
      await navigator.share({
        title: `Приглашение в центр`,
        text: 'Присоединяйтесь к центру в качестве преподавателя.',
        url: inviteUrl,
      });
    } catch {
      // Пользователь закрыл системное окно "Поделиться"
    }
  }

  return (
    <Box>
      <Stack spacing={1}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ color: 'white' }}>
            Кабинеты
          </Typography>

          <IconButton aria-label="Сгенерировать обложку" onClick={() => setIsCreateLocationDialogOpen(true)}>
            <PersonAddIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {locations?.map(location => (
            <LocationCard location={location} />
          ))}
        </Stack>
      </Stack>

      <CreateLocationDialog open={isCreateLocationDialogOpen} onClose={() => setIsCreateLocationDialogOpen(false)} />

      {/*<Dialog open={isCreateLocationDialogOpen} fullScreen={false} onClose={() => setIsCreateLocationDialogOpen(false)}>*/}
      {/*  <DialogTitle>Добавьте кабинет</DialogTitle>*/}

      {/*  <DialogContent dividers>*/}
      {/*    <Stack direction="column" spacing={2}>*/}
      {/*      <Stack direction="row" spacing={2}>*/}
      {/*        <TextField label="Название" value={title} onChange={e => setTitle(e.target.value)} />*/}

      {/*        <Button variant="contained" onClick={() => addTeacher.mutate()}>*/}
      {/*          Добавить*/}
      {/*        </Button>*/}
      {/*      </Stack>*/}
      {/*    </Stack>*/}
      {/*  </DialogContent>*/}
      {/*</Dialog>*/}
    </Box>
  );
}
