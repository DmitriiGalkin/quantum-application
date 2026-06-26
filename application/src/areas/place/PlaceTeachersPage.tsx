import { useMutation, useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { fetchAddTeacher, fetchPlaceTeachers, fetchRemoveTeacher } from '../../requests.ts';


export default function PlaceTeachersPage() {
  const { id } = useParams();
  const placeId = Number(id);

  const [passportId, setPassportId] = useState('');

  const teachersQuery = useQuery({
    queryKey: ['place-teachers', placeId],
    queryFn: () => fetchPlaceTeachers(),
  });

  const addTeacher = useMutation({
    mutationFn: () => fetchAddTeacher({passportId:Number(passportId)}),
    onSuccess: () => {
      teachersQuery.refetch();
      setPassportId('');
    },
  });

  const removeTeacher = useMutation({
    mutationFn: (passportId: number) => fetchRemoveTeacher({passportId}),
    onSuccess: () => teachersQuery.refetch(),
  });

  return (
    <Box>
      <Stack spacing={3}>
        <Typography variant="h4">Учителя центра</Typography>

        <Stack direction="row" spacing={2}>
          <TextField label="Passport ID" value={passportId} onChange={e => setPassportId(e.target.value)} />

          <Button variant="contained" onClick={() => addTeacher.mutate()}>
            Добавить
          </Button>
        </Stack>

        <Stack spacing={2}>
          {teachersQuery.data?.map((t: any) => (
            <Card key={t.id}>
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between'}}>
                  <Typography>{t.title}</Typography>

                  <Button color="error" onClick={() => removeTeacher.mutate(t.id)}>
                    Удалить
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}
