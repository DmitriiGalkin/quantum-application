import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchAddTeacher, fetchPlaceTeachers } from '../../requests.ts';
import TeacherCard from '../../features/teacher/TeacherCard.tsx';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

export default function PlaceTeachersPage() {
  const { id } = useParams();
  const placeId = Number(id);
  const [isPersonAddModalOpen, setIsPersonAddModalOpen] = useState(false);

  const [passportId, setPassportId] = useState('');

  const { data: teachers, refetch } = useQuery({
    queryKey: ['place-teachers', placeId],
    queryFn: () => fetchPlaceTeachers(placeId),
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher(Number(passportId)),
    onSuccess: () => {
      refetch();
      setPassportId('');
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
            Учителя центра
          </Typography>

          <IconButton aria-label="Сгенерировать обложку" onClick={() => setIsPersonAddModalOpen(true)}>
            <PersonAddIcon sx={{ color: 'white' }} />
          </IconButton>
        </Stack>

        <Stack spacing={2}>
          {teachers?.map(teacher => (
            <TeacherCard teacher={teacher} refetch={refetch} placeId={placeId} />
          ))}
        </Stack>
      </Stack>

      <Dialog open={isPersonAddModalOpen} fullScreen={false} onClose={() => setIsPersonAddModalOpen(false)}>
        <DialogTitle>Добавьте учителя удобным способом</DialogTitle>

        <DialogContent dividers>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField label="Passport ID" value={passportId} onChange={e => setPassportId(e.target.value)} />

              <Button variant="contained" onClick={() => addTeacher.mutate()}>
                Добавить
              </Button>
            </Stack>

            <Stack direction="column" spacing={2}>
              <Button variant="outlined" startIcon={<ContentCopyIcon />} onClick={handleCopy}>
                Копировать ссылку приглашение
              </Button>

              {Boolean(navigator.share) && (
                <Button variant="contained" startIcon={<ShareIcon />} onClick={handleShare}>
                  Поделиться приглашением
                </Button>
              )}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
