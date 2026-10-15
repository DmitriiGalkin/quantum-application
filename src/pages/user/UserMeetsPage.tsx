import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMeets } from '../../requests.ts';
import { useAuth } from '../../providers/auth-context.ts';
import Meets from '../../features/meets/Meets.tsx';
import FamilyAccess from '../../features/user/FamilyAccess.tsx';
import { userMeetSections } from '../../features/user/user-meet-sections.ts';

export default function UserMeetsPage() {
  const { userId, role } = useAuth();
  const [section, setSection] = useState<'upcoming' | 'history'>('upcoming');
  const query = useQuery({ queryKey: ['meets', 'user', userId], queryFn: fetchMeets, enabled: role === 'user' && Boolean(userId) });
  const sections = userMeetSections(query.data ?? []);
  return <FamilyAccess><Stack spacing={3}>
    <Typography component="h1" variant="h4">Мои встречи</Typography>
    <ToggleButtonGroup exclusive value={section} onChange={(_, next: 'upcoming' | 'history' | null) => { if (next) setSection(next); }} sx={{ alignSelf: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
      <ToggleButton value="upcoming">Предстоящие</ToggleButton><ToggleButton value="history">Прошедшие и отменённые</ToggleButton>
    </ToggleButtonGroup>
    {query.isPending ? <Typography role="status">Загрузка встреч…</Typography>
      : query.isError ? <Alert severity="error" action={<Button onClick={() => void query.refetch()}>Повторить</Button>}>Не удалось загрузить встречи.</Alert>
        : sections[section].length ? <Meets title={section === 'upcoming' ? 'Предстоящие встречи' : 'История встреч'} meets={sections[section]} refetch={() => void query.refetch()} />
          : <Typography>{section === 'upcoming' ? 'Предстоящих встреч пока нет.' : 'Прошедших и отменённых встреч пока нет.'}</Typography>}
    <Button component={Link} to="/" sx={{ alignSelf: 'flex-start' }}>Выбрать проект</Button>
  </Stack></FamilyAccess>;
}
