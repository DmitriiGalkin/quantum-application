import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import type { PassportExtendedDto } from 'entities';
import { useAuth } from '../../providers/auth-context.ts';
import { fetchUpdatePassport } from '../../requests.ts';

interface ProfileValues {
  title: string;
  description: string;
  image: string;
}

export default function TeacherProfilePage() {
  const { passport, token, isPending, refetch } = useAuth();
  if (!passport) return <Typography role="status">{token && isPending ? 'Загрузка профиля…' : 'Войдите, чтобы редактировать профиль.'}</Typography>;
  return <Profile key={passport.id} passport={passport} refetch={refetch} />;
}

function Profile({ passport, refetch }: { passport: PassportExtendedDto; refetch: ReturnType<typeof useAuth>['refetch'] }) {
  const client = useQueryClient();
  const [values, setValues] = useState<ProfileValues>({
    title: passport.title,
    description: passport.description ?? '',
    image: passport.image ?? '',
  });
  const save = useMutation({
    mutationFn: () => fetchUpdatePassport({
      title: values.title.trim(),
      description: values.description.trim() || null,
      image: values.image.trim() || null,
    }),
    onSuccess: async () => {
      await refetch();
      await client.invalidateQueries({ queryKey: ['teacher', String(passport.id)] });
    },
  });

  return <Stack spacing={3} sx={{ maxWidth: 640 }}>
    <Typography component="h1" variant="h4">Профиль преподавателя</Typography>
    <Typography color="text.secondary">Эти сведения видны на вашей странице преподавателя.</Typography>
    <Avatar src={values.image || undefined} alt={values.title} sx={{ width: 96, height: 96 }}>{values.title?.[0]}</Avatar>
    <Stack component="form" spacing={2} onSubmit={event => { event.preventDefault(); if (values.title.trim()) save.mutate(); }}>
      <TextField label="Имя преподавателя" value={values.title} required fullWidth disabled={save.isPending}
        slotProps={{ htmlInput: { maxLength: 255 } }} onChange={event => setValues({ ...values, title: event.target.value })} />
      <TextField label="О себе" value={values.description} multiline minRows={4} fullWidth disabled={save.isPending}
        onChange={event => setValues({ ...values, description: event.target.value })} />
      <TextField label="URL фотографии" value={values.image} fullWidth disabled={save.isPending}
        slotProps={{ htmlInput: { maxLength: 255 } }} onChange={event => setValues({ ...values, image: event.target.value })} />
      {save.isError && <Alert severity="error">Не удалось сохранить профиль: {save.error.message}</Alert>}
      {save.isSuccess && <Alert severity="success">Профиль сохранён.</Alert>}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        <Button type="submit" variant="contained" disabled={save.isPending || !values.title.trim()}>
          {save.isPending ? 'Сохранение…' : 'Сохранить профиль'}
        </Button>
        <Button component={Link} to={`/teachers/${passport.id}`}>Посмотреть профиль</Button>
      </Stack>
    </Stack>
  </Stack>;
}
