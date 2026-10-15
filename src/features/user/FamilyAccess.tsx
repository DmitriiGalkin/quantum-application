import { useState, type ReactNode } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { useAuth } from '../../providers/auth-context.ts';
import SelectMeetChildDialog from '../meets/SelectMeetChildDialog.tsx';

export default function FamilyAccess({ children }: { children: ReactNode }) {
  const { passport, token, role, userId, isPending, authHandler } = useAuth();
  const [selectChild, setSelectChild] = useState(false);
  if (role === 'user' && userId) return children;
  if (token && isPending) return <Typography role="status">Загрузка семейного кабинета…</Typography>;
  return <Stack spacing={2} sx={{ maxWidth: 640 }}>
    <Typography component="h1" variant="h4">Семейный кабинет</Typography>
    <Typography>{passport ? 'Выберите ребёнка, чтобы посмотреть его встречи, проекты и идеи.' : 'Войдите, чтобы посмотреть встречи и проекты ребёнка.'}</Typography>
    <Button variant="contained" onClick={() => passport ? setSelectChild(true) : authHandler()}>
      {passport ? 'Выбрать или добавить ребёнка' : 'Войти в кабинет'}
    </Button>
    <Button component={Link} to="/">Выбрать проект</Button>
    {selectChild && <SelectMeetChildDialog open onClose={() => setSelectChild(false)} description="Кабинет откроется для выбранного ребёнка." />}
  </Stack>;
}
