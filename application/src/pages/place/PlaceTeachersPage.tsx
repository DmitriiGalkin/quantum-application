import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { fetchAddTeacher, fetchPlaceTeachers, fetchRemoveTeacher } from '../../requests.ts';
import TeacherCard from '../../features/teacher/TeacherCard.tsx';
import ShareIcon from '@mui/icons-material/Share';

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

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Учителя центра</Typography>

        <Stack direction="row" spacing={2}>
          <Stack direction="row" spacing={2}>
            <TextField label="Passport ID" value={passportId} onChange={e => setPassportId(e.target.value)} />

            <Button variant="contained" onClick={() => addTeacher.mutate()}>
              Добавить
            </Button>
          </Stack>

          <Button startIcon={<ShareIcon />} onClick={() => navigator.clipboard.writeText(`${window.location.origin}/place/${placeId}/invite`)}>
            Скопировать ссылку приглашения
          </Button>
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
