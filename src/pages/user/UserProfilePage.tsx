import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import type { UserDto } from 'entities';
import { useAuth } from '../../providers/auth-context.ts';
import { fetchUpdateUser } from '../../requests.ts';
import FamilyAccess from '../../features/user/FamilyAccess.tsx';
import UserProfileForm, { type UserProfileValues } from '../../features/user/UserProfileForm.tsx';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { passport, token, isPending } = useAuth();
  if (!passport) return token && isPending ? <Typography role="status">Загрузка профиля…</Typography> : <FamilyAccess>{null}</FamilyAccess>;
  const user = passport.users.find(user => user.id === Number(id));
  if (!user) return <Alert severity="info">Этот профиль недоступен в вашем семейном аккаунте.</Alert>;
  return <Profile key={user.id} user={user} />;
}

function Profile({ user }: { user: UserDto }) {
  const { refetch, switchUser } = useAuth();
  const navigate = useNavigate();
  const initial = (): UserProfileValues => ({ title: user.title, age: user.age ?? '', image: user.image ?? '' });
  const [values, setValues] = useState(initial);
  const [editing, setEditing] = useState(false);
  const save = useMutation({ mutationFn: () => fetchUpdateUser(user.id, { title: values.title.trim(), age: values.age === '' ? null : values.age, image: values.image || null }),
    onSuccess: async () => { await refetch(); setEditing(false); } });
  return <Stack spacing={3} sx={{ maxWidth: 640, overflowWrap: 'anywhere' }}>
    <Typography component="h1" variant="h4">Профиль ребёнка</Typography>
    <Avatar src={user.image || undefined} alt={user.title} sx={{ width: 96, height: 96 }}>{user.title?.[0]}</Avatar>
    {editing ? <UserProfileForm values={values} onChange={setValues} onSubmit={() => save.mutate()} onCancel={() => setEditing(false)} loading={save.isPending} error={save.error?.message} />
      : <><Typography variant="h5">{user.title}</Typography><Typography>{user.age === null ? 'Возраст не указан' : `Возраст: ${user.age}`}</Typography>
        {save.isSuccess && <Alert severity="success">Профиль сохранён.</Alert>}
        <Button variant="outlined" onClick={() => { setValues(initial()); save.reset(); setEditing(true); }}>Редактировать профиль</Button></>}
    <Button disabled={save.isPending} onClick={() => { switchUser(user.id); navigate('/user'); }}>Открыть кабинет ребёнка</Button>
  </Stack>;
}
