import Stack from '@mui/material/Stack';
import { type MeetExtendedDto } from '@shared/types';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import MeetGrids from './MeetGrids.tsx';
import WeekCalendar from './WeekCalendar/WeekCalendar.tsx';
import { useMemo, useState } from 'react';
import { groupMeets } from './groupMeets.ts';
import { addDays, format, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';

type Props = {
  title: string;
  meets: MeetExtendedDto[];
  refetch?: any;
};

function Meets({ title, meets, refetch }: Props) {
  const theme = useTheme();
  const [view, setView] = useState<'week' | 'module'>('module');
  const grouped = meets?.length ? groupMeets(meets) : [];
  const [selectedDay, setSelectedDay] = useState(0);
  const weekStart = useMemo(
    () =>
      startOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
    [1],
  );
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  const days = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const visibleDays = mobile ? [days[selectedDay]] : days;

  return (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          {title}
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, nextView: string) => {
            setView(nextView as 'week' | 'module');
          }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              color: '#fff', // иконки
              borderColor: 'rgba(255,255,255,0.5)',

              '&.Mui-selected': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.2)',
              },

              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
              },
            },
          }}
        >
          <ToggleButton value="module" aria-label="module">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="week" aria-label="week">
            <ViewWeekIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <ToggleButtonGroup
        exclusive
        value={selectedDay}
        onChange={(_, value) => {
          if (value !== null) {
            setSelectedDay(value);
          }
        }}
        sx={{
          p: 0.5,
          overflowX: 'auto',
          flexWrap: 'nowrap',

          '& .MuiToggleButtonGroup-grouped': {
            borderRadius: 2,
            mx: 0.25,
            border: 1,
            borderColor: 'divider',
            minWidth: 60,
            flexShrink: 0,
          },

          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {days.map((day, index) => (
          <ToggleButton key={index} value={index}>
            <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
              <Typography variant="caption">{format(day, 'EE', { locale: ru })}</Typography>

              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {format(day, 'd')}
              </Typography>
            </Stack>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {meets?.length === 0 && <Typography color="text.secondary">Запланированных встреч нет</Typography>}

      {view === 'module' &&
        meets &&
        Object.entries(grouped).map(([dateLabel, items]) => (
          <Stack key={dateLabel} spacing={1}>
            <Typography variant="h6" color="text.secondary">
              {dateLabel}
            </Typography>

            <MeetGrids meets={items} refetch={refetch} />
          </Stack>
        ))}

      {view === 'week' && (
        <WeekCalendar
          meets={meets || []}
          visibleDays={visibleDays || []}
          onMeetClick={() => {
            // console.log('Встреча', meet);
            // navigate(`/meet/${meet.id}`);
          }}
          onCellClick={date => {
            console.log('Создать встречу', date);
            // navigate(`/meet/create?startedAt=${date.toISOString()}`);
          }}
          single={mobile}
        />
      )}
    </Stack>
  );
}

export default Meets;
