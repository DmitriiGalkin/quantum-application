import { Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import MeetCard from '../../features/meets/MeetCard/MeetCard.tsx';
import WeekCalendar from '../../features/meets/WeekCalendar.tsx';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';

import { useState } from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';


//
// Для центра это одна из самых полезных страниц, поэтому позже сюда хорошо ложатся:
//
//   фильтр по учителю
// фильтр по проекту
// календарный вид
// количество участников
// отметка "встреча завершена"

export default function PlaceMeetsPage() {
  const { id } = useParams();
  const placeId = Number(id);
  const [view, setView] = useState<'week' | 'module'>('module');

  const { data: meets, refetch } = useQuery({
    queryKey: ['meets', placeId],
    queryFn: () => fetchMeets({ placeId: placeId || 0 }),
    enabled: !!placeId,
  });

  return (
    <Stack spacing={3}>
      <Stack spacing={2} direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: 'white' }}>
          Расписание центра
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

      {view === 'module' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
              lg: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {meets?.map(meet => (
            <MeetCard key={meet.id} meet={meet} refetch={refetch} />
          ))}
        </Box>
      )}

      {view === 'week' && (
        <WeekCalendar
          meets={meets || []}
          onMeetClick={meet => {
            console.log('Встреча', meet);
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
