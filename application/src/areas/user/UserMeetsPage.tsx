import { Stack, Typography } from '@mui/material';
import { groupMeets } from './groupMeets';
import MeetingCardContainer, { toMeeting } from '../../features/meets/ui/MeetingCard/MeetingCardContainer.tsx';
import { useQuery } from '@tanstack/react-query';
import { fetchMeets } from '../../requests.ts';
import { useAuth } from '../../providers/AuthProvider.tsx';
import Page from '../../shared/ui/Page.tsx';

export default function UserMeetsPage() {
  const { user } = useAuth()
  const { data: meets } = useQuery({
    queryKey: ['meets', user?.id],
    queryFn: () => fetchMeets({ userId: user?.id || 0 }),
    enabled: !!user?.id,
  });

  const grouped = meets?.length ? groupMeets(meets) : [];

  return (
    <Page>
      <Stack spacing={3}>
        <Typography variant="h4">Мои встречи</Typography>

        {Object.entries(grouped).map(([dateLabel, items]) => (
          <Stack key={dateLabel} spacing={1}>
            <Typography variant="h6" color="text.secondary">
              {dateLabel}
            </Typography>

            {items.map(meet => (
              <MeetingCardContainer
                key={meet.id}
                meeting={toMeeting(meet)}
                role="user"
                onPay={() => console.log('onPay')}
                onJoin={() => console.log('onJoin')}
                onOpen={open}
              />
            ))}
          </Stack>
        ))}
      </Stack>
    </Page>
  );
}
