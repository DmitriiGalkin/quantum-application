import { Stack, Typography } from '@mui/material';
import { groupMeets } from './groupMeets.ts';
import MeetCard from '../../features/meets/MeetCard.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';

export default function UserMeetsPage() {
  const { activeUser } = useAuth();
  const { data: meets } = useQuery({
    queryKey: ['meets', activeUser?.id],
    queryFn: () => fetchMeets({ userId: activeUser?.id || 0 }),
    enabled: !!activeUser?.id,
  });

  const grouped = meets?.length ? groupMeets(meets) : [];

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Мои встречи</Typography>

      {Object.entries(grouped).map(([dateLabel, items]) => (
        <Stack key={dateLabel} spacing={1}>
          <Typography variant="h6" color="text.secondary">
            {dateLabel}
          </Typography>

          {items.map(meet => (
            <MeetCard key={meet.id} meet={meet} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
