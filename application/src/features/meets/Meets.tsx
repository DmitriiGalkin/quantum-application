import Stack from '@mui/material/Stack';
import { type MeetExtendedDto } from '@shared/types';
import { Typography } from '@mui/material';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import MeetGrids from './MeetGrids.tsx';
import WeekCalendar from './WeekCalendar/WeekCalendar.tsx';
import { useState } from 'react';
import { groupMeets } from './groupMeets.ts'; // Добавлен импорт

type Props = {
  title: string;
  meets: MeetExtendedDto[];
  refetch?: any;
};

function Meets({ title, meets, refetch }: Props) {
  const [view, setView] = useState<'week' | 'module'>('module');
  const grouped = meets?.length ? groupMeets(meets) : [];

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
          onMeetClick={() => {
            // console.log('Встреча', meet);
            // navigate(`/meet/${meet.id}`);
          }}
          onCellClick={date => {
            console.log('Создать встречу', date);
            // navigate(`/meet/create?startedAt=${date.toISOString()}`);
          }}
        />
      )}
    </Stack>
  );
}

export default Meets;
