import type { MeetExtendedDto, PassportDto } from '@shared/types';
import { Button, Card } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { fetchCreateMeetUser, fetchDeleteMeetUser } from '../../../requests.ts';
import { useAuth } from '../../../providers/AuthProvider.tsx';
import Box from '@mui/material/Box';
import MeetCardHeader from './MeetCardHeader.tsx';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';

type Props = {
  meet: MeetExtendedDto;
  refetch?: () => void;
  passport?: PassportDto;
  withoutAction?: boolean;
  withoutUsers?: boolean;
};

function Meet({ meet, refetch, passport, withoutAction, withoutUsers }: Props) {
  const { user, authHandler } = useAuth();

  const liked = user && meet.users?.some(u => u.id === user.id);

  const mutationLike = useMutation({
    mutationFn: fetchCreateMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const mutationUnlike = useMutation({
    mutationFn: fetchDeleteMeetUser,
    onSuccess: () => {
      refetch?.();
    },
  });

  const handleLike = () => {
    if (user) mutationLike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  const handleUnlike = () => {
    if (user) mutationUnlike.mutate({ userId: user.id, meetId: meet.id });
    else authHandler();
  };

  return (
    <Card>
      {passport && <MeetCardHeader passport={passport} handleUnlike={liked && handleUnlike} />}
      <Box sx={{ px: 2, py: 1, backgroundColor: 'rgba(255,182,40,0.15)' }}>
        <Typography variant="caption" color="text.secondary">
          Ближайшая встреча
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {/* MAIN ROW */}
          <Stack direction="row" spacing={1}>
            {/* DATE BLOCK */}
            <Box
              sx={{
                width: 44,
                height: 56,
                borderRadius: 2,
                backgroundColor: 'rgba(255,182,40,0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Typography variant="caption">
                {new Date(meet.startedAt).toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase()}
              </Typography>

              <Typography variant="h6">{new Date(meet.startedAt).getDate()}</Typography>
            </Box>

            {/* INFO */}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2">
                {new Date(meet.startedAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>

              <Typography variant="caption" color="text.secondary" noWrap>
                ул. Северодвинская 11
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 1.5 }}>{meet.price ? `${meet.price} ₽` : 'Бесплатно'}</Typography>
            </Box>
          </Stack>

          {/* PARTICIPANTS */}
          {!withoutUsers && (
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroupUsers users={meet.users || []} />
              <Typography variant="caption" color="text.secondary">
                {meet.users?.length || 0} идут
              </Typography>
            </Stack>
          )}
        </Stack>
        <div>Управление встречей</div>
      </Box>
    </Card>
  );
}

export default Meet;
