import Stack from '@mui/material/Stack';
import { type MeetExtendedDto } from '@shared/types';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import WeekCalendar from './WeekCalendar/WeekCalendar.tsx';
import { useMemo, useState } from 'react';
import { groupMeets } from './groupMeets.ts';
import { addDays, format, startOfWeek } from 'date-fns';
import { ru } from 'date-fns/locale';
import MeetGroupGrids from './MeetGroupGrids.tsx';

type Props = {
  title: string;
  meets: MeetExtendedDto[];
  refetch?: any;
};

function Meets({ title, meets, refetch }: Props) {
  const theme = useTheme();
  const [view, setView] = useState<'week' | 'module'>('module');
  const grouped = groupMeets(meets);

  const now = new Date();
  now.setHours(0, 0, 0, 0); // Обнуляем время для точности до дня

  const [selectedDay, setSelectedDay] = useState(now.getTime());
  const weekStart = useMemo(
    () =>
      startOfWeek(new Date(), {
        weekStartsOn: 1,
      }),
    [1],
  );
  const mobile = useMediaQuery(theme.breakpoints.down('md'));

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(weekStart, index);
        date.setHours(0, 0, 0, 0); // Обнуляем время
        return date.getTime();
      }),
    [weekStart],
  );

  const visibleDays = mobile ? [selectedDay] : days;

  const group = grouped.get(selectedDay);

  return (
    <Stack spacing={2}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          {title}
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, nextView: 'week' | 'module') => {
            setView(nextView);
          }}
          size="small"
        >
          <ToggleButton value="module" aria-label="module">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="week" aria-label="week">
            <ViewWeekIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {meets?.length === 0 && <Typography color="text.secondary">Запланированных встреч нет</Typography>}

      {mobile ? (
        <Stack spacing={2} direction="column">
          <ToggleButtonGroup
            exclusive
            value={selectedDay}
            onChange={(_, value) => {
              if (value !== null) {
                setSelectedDay(value);
              }
            }}
            sx={{
              width: '100%',

              '& .MuiToggleButtonGroup-grouped': {
                flex: 1,
                minWidth: 0,

                borderRadius: 2,
                mx: 0.25,
                border: 1,
                borderColor: 'divider',
              },
              '& .MuiToggleButton-root': {
                color: '#fff', // иконки
                borderColor: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            {days.map((day, index) => (
              <ToggleButton key={index} value={day}>
                <Stack spacing={0.25} sx={{ alignItems: 'center' }}>
                  <Typography variant="caption">{format(day, 'EEEEEE', { locale: ru })}</Typography>

                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {format(day, 'd')}
                  </Typography>
                </Stack>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {view === 'module' && group && <MeetGroupGrids meets={group} refetch={refetch} />}
        </Stack>
      ) : (
        <Stack spacing={2} direction="column">
          {view === 'module' &&
            meets &&
            Object.entries(grouped).map(([dateLabel, items]) => <MeetGroupGrids title={dateLabel} meets={items} refetch={refetch} />)}
        </Stack>
      )}

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
