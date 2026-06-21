import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { MeetExtendedDto } from '@shared/types';
import AvatarGroupUsers from '../../../shared/ui/AvatarGroupUsers.tsx';

type ProjectMeetCardProps = {
  meet: MeetExtendedDto;
};

function ProjectMeetCard({ meet }: ProjectMeetCardProps) {
  return (
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
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <AvatarGroupUsers users={meet.users || []} />
        <Typography variant="caption" color="text.secondary">
          {meet.users?.length || 0} идут
        </Typography>
      </Stack>
    </Stack>
  );
}

export default ProjectMeetCard;
