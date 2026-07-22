import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchAddTeacher, fetchPlaceTeachers, fetchRemoveTeacher } from '../../requests.ts';
import TeacherCard from '../../features/teacher/TeacherCard.tsx';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function PlaceTeachersPage() {
  const { id } = useParams();
  const placeId = Number(id);

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

  const removeTeacher = useMutation({
    mutationFn: (passportId: number) => fetchRemoveTeacher(passportId),
    onSuccess: () => refetch(),
  });

  const onDelete = (id: number) => removeTeacher.mutate(id);
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
      <Stack spacing={3}>
        <Typography variant="h4">Учителя центра</Typography>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between'}}>
          <Stack direction="row" spacing={2}>
            <TextField label="Passport ID" value={passportId} onChange={e => setPassportId(e.target.value)} />

            <Button variant="contained" onClick={() => addTeacher.mutate()}>
              Добавить
            </Button>
          </Stack>

          <Stack direction="row" spacing={2}>
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

        <Stack spacing={2}>
          {teachers?.map(teacher => (
            <TeacherCard teacher={teacher} onDelete={() => onDelete(teacher.id)} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
