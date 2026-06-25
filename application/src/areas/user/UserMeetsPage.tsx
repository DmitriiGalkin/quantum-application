import { Stack, Typography, Card, CardContent } from '@mui/material';
import { groupMeets } from './groupMeets';

type Meet = {
  id: number;
  title: string;
  startedAt: string;
};

export default function UserMeetsPage() {
  // MVP мок
  const meets: Meet[] = [
    { id: 1, title: 'Робототехника', startedAt: '2026-06-25T18:00:00' },
    { id: 2, title: 'Английский', startedAt: '2026-06-25T19:30:00' },
    { id: 3, title: 'Математика', startedAt: '2026-06-26T17:00:00' },
  ];

  const grouped = groupMeets(meets);

  return (
    <Stack spacing={3}>
      <Typography variant="h4" >
        Мои встречи
      </Typography>

      {Object.entries(grouped).map(([dateLabel, items]) => (
        <Stack key={dateLabel} spacing={1}>
          <Typography variant="h6" color="text.secondary">
            {dateLabel}
          </Typography>

          {items.map(meet => (
            <Card key={meet.id} variant="outlined">
              <CardContent>
                <Typography>{meet.title}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {new Date(meet.startedAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ))}
    </Stack>
  );
}
