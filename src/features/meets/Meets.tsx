import { useState } from 'react';
import Stack from '@mui/material/Stack';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Button from '@mui/material/Button';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import type { MeetDto } from 'entities';
import WeekCalendar from './WeekCalendar/WeekCalendar.tsx';
import { groupMeets } from './groupMeets.ts';
import MeetGroupGrids from './MeetGroupGrids.tsx';
import { DAY_MS, moscowDay, moscowFormat, moscowWeek } from './moscow-time.ts';

interface Props { title: string; meets: MeetDto[]; refetch?: () => void }

export default function Meets({ title, meets, refetch }: Props) {
  const theme = useTheme();
  const mobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState<'week' | 'module'>('module');
  const [selectedDay, setSelectedDay] = useState(() => moscowDay(new Date()));
  const [weekStart, setWeekStart] = useState(() => moscowWeek(new Date()));
  const grouped = groupMeets(meets);
  const days = Array.from({ length: 7 }, (_, index) => weekStart + index * DAY_MS);
  const moveWeek = (direction: number) => {
    const next = weekStart + direction * 7 * DAY_MS;
    setWeekStart(next); setSelectedDay(next);
  };
  const today = () => {
    setWeekStart(moscowWeek(new Date())); setSelectedDay(moscowDay(new Date()));
  };
  return <Stack spacing={2}>
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="h5" sx={{ color: 'white' }}>{title}</Typography>
      <ToggleButtonGroup value={view} exclusive size="small" onChange={(_, next: 'week' | 'module' | null) => { if (next) setView(next); }}>
        <ToggleButton value="module" aria-label="Список встреч"><ViewModuleIcon /></ToggleButton>
        <ToggleButton value="week" aria-label="Недельный календарь"><ViewWeekIcon /></ToggleButton>
      </ToggleButtonGroup>
    </Stack>
    {!meets.length && <Typography color="text.secondary">Запланированных встреч нет</Typography>}
    {view === 'module' && [...grouped].map(([day, items]) => <MeetGroupGrids key={day}
      title={moscowFormat(day, { day: 'numeric', month: 'long', year: 'numeric' })} meets={items} refetch={refetch} />)}
    {view === 'week' && <>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={() => moveWeek(-1)} aria-label="Предыдущая неделя">←</Button>
        <Typography>{moscowFormat(days[0], { day: 'numeric', month: 'short' })} — {moscowFormat(days[6], { day: 'numeric', month: 'short', year: 'numeric' })} МСК</Typography>
        <Button onClick={() => moveWeek(1)} aria-label="Следующая неделя">→</Button>
        <Button onClick={today}>Сегодня</Button>
      </Stack>
      {mobile && <ToggleButtonGroup exclusive value={selectedDay} onChange={(_, day: number | null) => { if (day !== null) setSelectedDay(day); }} sx={{ width: '100%' }}>
        {days.map(day => <ToggleButton key={day} value={day} sx={{ flex: 1, minWidth: 0 }} aria-label={moscowFormat(day, { day: 'numeric', month: 'long' })}>
          <Stack sx={{ alignItems: 'center' }}>
            <Typography variant="caption">{moscowFormat(day, { weekday: 'short' })}</Typography>
            <Typography>{moscowFormat(day, { day: 'numeric' })}</Typography>
            {grouped.has(day) && <Typography variant="caption" aria-label="Есть встречи">●</Typography>}
          </Stack>
        </ToggleButton>)}
      </ToggleButtonGroup>}
      <WeekCalendar meets={meets} visibleDays={mobile ? [selectedDay] : days} single={mobile} />
    </>}
  </Stack>;
}
